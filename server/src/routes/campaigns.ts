import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import Campaign from '../models/Campaign';
import Segment from '../models/Segment';
import Customer from '../models/Customer';
import Communication from '../models/Communication';
import {
  generatePersonalizedMessages,
  generateCampaignIntelligence,
  generateSmartSendTime,
} from '../services/ai.service';

const router = Router();

const CHANNEL_SERVICE_URL =
  process.env.CHANNEL_SERVICE_URL || 'http://localhost:3002';

/**
 * GET /api/campaigns
 * List all campaigns with populated segment data, newest first.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name customerCount naturalLanguageQuery')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ campaigns });
  } catch (error: any) {
    console.error('[Campaigns] GET / error:', error.message);
    res.status(500).json({ error: 'Failed to fetch campaigns', details: error.message });
  }
});

/**
 * GET /api/campaigns/:id
 * Single campaign with all communications populated with customer data.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId')
      .lean();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const communications = await Communication.find({
      campaignId: campaign._id,
    })
      .populate('customerId', 'name email city channelPreference engagementScore tags')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ campaign, communications });
  } catch (error: any) {
    console.error('[Campaigns] GET /:id error:', error.message);
    res.status(500).json({ error: 'Failed to fetch campaign', details: error.message });
  }
});

/**
 * POST /api/campaigns
 * Create a new campaign draft. Optionally generate AI send-time suggestions.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, segmentId, messageTemplate, channel, scheduledAt } = req.body;

    if (!name || !segmentId || !messageTemplate) {
      return res.status(400).json({
        error: 'name, segmentId, and messageTemplate are required',
      });
    }

    // Validate segment exists
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Generate AI send-time suggestion
    let aiSuggestions;
    try {
      const segmentCustomers = await Customer.find({
        _id: { $in: segment.customerIds },
      }).lean();
      const sendTime = await generateSmartSendTime(segmentCustomers);
      aiSuggestions = {
        sendTime: sendTime.recommendedTime,
        reasoning: sendTime.reasoning,
      };
    } catch (aiError: any) {
      console.warn('[Campaigns] AI send-time suggestion failed:', aiError.message);
    }

    const campaign = await Campaign.create({
      name,
      segmentId,
      messageTemplate,
      channel: channel || 'mixed',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      aiSuggestions,
    });

    res.status(201).json({ campaign });
  } catch (error: any) {
    console.error('[Campaigns] POST / error:', error.message);
    res.status(500).json({ error: 'Failed to create campaign', details: error.message });
  }
});

/**
 * POST /api/campaigns/:id/send
 * THE BIG ONE — sends a campaign to all customers in its segment.
 *
 * 1. Fetches the campaign and its segment's customers
 * 2. Calls AI to generate personalised messages
 * 3. Creates Communication docs (status: queued)
 * 4. Updates campaign status to 'sending'
 * 5. Sends each to the channel service (async — returns 200 immediately)
 * 6. Channel service will POST back to /api/receipt/status
 */
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        error: `Campaign is already ${campaign.status} — can only send drafts`,
      });
    }

    // Fetch the segment and its customers
    const segment = await Segment.findById(campaign.segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Campaign segment not found' });
    }

    const customers = await Customer.find({
      _id: { $in: segment.customerIds },
    }).lean();

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers in this segment' });
    }

    // Generate personalised messages via AI
    const personalizedMessages = await generatePersonalizedMessages(
      customers,
      campaign.messageTemplate,
      campaign.name,
      campaign.channel
    );

    // Create Communication documents for each message
    const communicationDocs = personalizedMessages.map((pm) => ({
      campaignId: campaign._id,
      customerId: pm.customerId,
      channel: pm.channel,
      channelReason: pm.channelReason,
      personalizedMessage: pm.personalizedMessage,
      status: 'queued' as const,
    }));

    const communications = await Communication.insertMany(communicationDocs);

    // Update campaign status and stats
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    campaign.stats.total = communications.length;
    campaign.stats.queued = communications.length;
    await campaign.save();

    // Return immediately — delivery happens async
    res.json({
      message: 'Campaign send initiated',
      campaignId: campaign._id,
      totalMessages: communications.length,
    });

    // Fire-and-forget: send each communication to the channel service
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/receipt/status`;

    for (const comm of communications) {
      try {
        await fetch(`${CHANNEL_SERVICE_URL}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            communicationId: comm._id.toString(),
            customerId: comm.customerId.toString(),
            channel: comm.channel,
            message: comm.personalizedMessage,
            callbackUrl,
          }),
        });
      } catch (sendError: any) {
        // Mark individual communication as failed if channel service is unreachable
        console.error(
          `[Campaigns] Failed to send comm ${comm._id}:`,
          sendError.message
        );
        await Communication.findByIdAndUpdate(comm._id, {
          status: 'failed',
          failedAt: new Date(),
          failureReason: `Channel service unreachable: ${sendError.message}`,
        });
        await Campaign.findByIdAndUpdate(campaign._id, {
          $inc: { 'stats.failed': 1, 'stats.queued': -1 },
        });
      }
    }

    // After all sends attempted, update status to 'sent'
    await Campaign.findByIdAndUpdate(campaign._id, { status: 'sent' });
  } catch (error: any) {
    console.error('[Campaigns] POST /:id/send error:', error.message);
    res.status(500).json({ error: 'Failed to send campaign', details: error.message });
  }
});

/**
 * POST /api/campaigns/:id/intelligence
 * Generate a post-campaign AI intelligence report.
 */
router.post('/:id/intelligence', async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const communications = await Communication.find({
      campaignId: campaign._id,
    })
      .populate('customerId', 'name city tags engagementScore channelPreference')
      .lean();

    const report = await generateCampaignIntelligence(campaign, communications);

    // Store the report on the campaign
    await Campaign.findByIdAndUpdate(campaign._id, {
      intelligenceReport: report,
    });

    res.json({ report });
  } catch (error: any) {
    console.error('[Campaigns] POST /:id/intelligence error:', error.message);
    res.status(500).json({
      error: 'Failed to generate intelligence report',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign and all its associated communications.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.json({ message: 'Campaign already deleted' });
    }

    // Delete associated communications
    await Communication.deleteMany({ campaignId: campaign._id });

    // Delete the campaign
    await Campaign.findByIdAndDelete(campaign._id);

    res.json({ message: 'Campaign and associated communications deleted successfully' });
  } catch (error: any) {
    console.error('[Campaigns] DELETE /:id error:', error.message);
    res.status(500).json({ error: 'Failed to delete campaign', details: error.message });
  }
});

export default router;
