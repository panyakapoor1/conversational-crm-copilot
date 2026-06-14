import { Router, Request, Response } from 'express';
import Customer from '../models/Customer';
import Campaign from '../models/Campaign';
import Segment from '../models/Segment';
import { chatWithAI } from '../services/ai.service';

const router = Router();

/**
 * POST /api/chat
 * RAG-powered AI chat endpoint.
 *
 * Fetches live CRM data (customer stats, recent campaigns, segments),
 * injects it as context, and returns the AI response.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Fetch live context from MongoDB
    const [customerStatsAgg, recentCampaigns, segments] = await Promise.all([
      // Customer stats
      Customer.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            spendStats: [
              {
                $group: {
                  _id: null,
                  avgSpend: { $avg: '$totalSpend' },
                  totalRevenue: { $sum: '$totalSpend' },
                  avgEngagement: { $avg: '$engagementScore' },
                },
              },
            ],
            cityBreakdown: [
              { $group: { _id: '$city', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            tagBreakdown: [
              { $unwind: '$tags' },
              { $group: { _id: '$tags', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            channelBreakdown: [
              { $group: { _id: '$channelPreference', count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Recent campaigns
      Campaign.find()
        .populate('segmentId', 'name customerCount')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // All segments
      Segment.find()
        .select('name description customerCount naturalLanguageQuery tags createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const facets = customerStatsAgg[0] || {};
    const customerStats = {
      totalCustomers: facets.total?.[0]?.count || 0,
      ...(facets.spendStats?.[0] || {}),
      cityBreakdown: facets.cityBreakdown || [],
      tagBreakdown: facets.tagBreakdown || [],
      channelBreakdown: facets.channelBreakdown || [],
    };

    // Call AI with live context
    const response = await chatWithAI(message, {
      customerStats,
      recentCampaigns,
      segments,
    });

    res.json({
      response,
      context: {
        customersAnalysed: customerStats.totalCustomers,
        campaignsConsidered: recentCampaigns.length,
        segmentsAvailable: segments.length,
      },
    });
  } catch (error: any) {
    console.error('[Chat] POST / error:', error.message);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

export default router;
