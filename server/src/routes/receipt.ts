import { Router, Request, Response } from 'express';
import Communication from '../models/Communication';
import Campaign from '../models/Campaign';
import { emitCampaignUpdate } from '../services/socket.service';

const router = Router();

/**
 * Status transition map — defines which status field to update
 * when a delivery receipt comes in.
 */
const STATUS_TIMESTAMP_MAP: Record<string, string> = {
  sent: 'sentAt',
  delivered: 'deliveredAt',
  opened: 'openedAt',
  clicked: 'clickedAt',
  failed: 'failedAt',
};

/**
 * POST /api/receipt/status
 * Callback endpoint for the channel service.
 *
 * Receives delivery receipts and:
 * 1. Updates the Communication doc status + timestamp
 * 2. Atomically increments the Campaign stats counters
 * 3. Emits a real-time WebSocket update
 */
router.post('/status', async (req: Request, res: Response) => {
  try {
    const { communicationId, status, timestamp } = req.body;

    if (!communicationId || !status) {
      return res.status(400).json({ error: 'communicationId and status are required' });
    }

    const validStatuses = ['sent', 'delivered', 'opened', 'clicked', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find the communication and get its previous status
    const communication = await Communication.findById(communicationId);
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    const previousStatus = communication.status;

    // Update communication status and relevant timestamp
    const updateFields: any = { status };
    const timestampField = STATUS_TIMESTAMP_MAP[status];
    if (timestampField) {
      updateFields[timestampField] = timestamp ? new Date(timestamp) : new Date();
    }
    if (status === 'failed' && req.body.failureReason) {
      updateFields.failureReason = req.body.failureReason;
    }

    await Communication.findByIdAndUpdate(communicationId, updateFields);

    // Atomically update campaign stats:
    //   increment the new status counter by 1
    //   decrement the previous status counter by 1
    const incUpdate: any = {};
    incUpdate[`stats.${status}`] = 1;
    if (previousStatus && previousStatus !== status) {
      incUpdate[`stats.${previousStatus}`] = -1;
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      communication.campaignId,
      { $inc: incUpdate },
      { new: true }
    );

    // Emit real-time update via WebSocket
    if (updatedCampaign) {
      emitCampaignUpdate(
        updatedCampaign._id.toString(),
        updatedCampaign.stats
      );

      // Check if campaign is complete (no more queued or sent messages)
      if (
        updatedCampaign.stats.queued === 0 &&
        updatedCampaign.stats.sent === 0
      ) {
        await Campaign.findByIdAndUpdate(updatedCampaign._id, {
          status: 'completed',
          completedAt: new Date(),
        });
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Receipt] POST /status error:', error.message);
    res.status(500).json({ error: 'Failed to process receipt', details: error.message });
  }
});

export default router;
