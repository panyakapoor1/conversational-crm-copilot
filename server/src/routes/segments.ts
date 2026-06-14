import { Router, Request, Response } from 'express';
import Customer from '../models/Customer';
import Segment from '../models/Segment';
import {
  generateSegmentQuery,
  generateSegmentSuggestions,
} from '../services/ai.service';

const router = Router();

/**
 * Helper: fetch customer stats for the AI service.
 */
async function getCustomerStats() {
  const [totalCustomers, spendAgg, cityBreakdown, tagBreakdown, dateRange] =
    await Promise.all([
      Customer.countDocuments(),
      Customer.aggregate([
        {
          $group: {
            _id: null,
            avgSpend: { $avg: '$totalSpend' },
            maxSpend: { $max: '$totalSpend' },
            minSpend: { $min: '$totalSpend' },
            totalRevenue: { $sum: '$totalSpend' },
          },
        },
      ]),
      Customer.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Customer.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Customer.aggregate([
        {
          $group: {
            _id: null,
            earliest: { $min: '$firstOrderDate' },
            latest: { $max: '$lastOrderDate' },
          },
        },
      ]),
    ]);

  return {
    totalCustomers,
    spend: spendAgg[0] || {},
    cities: cityBreakdown.map((c: any) => `${c._id}: ${c.count}`),
    tags: tagBreakdown.map((t: any) => `${t._id}: ${t.count}`),
    dateRange: dateRange[0] || {},
  };
}

/**
 * Parse a MongoDB query that may contain date strings into
 * proper Date objects so Mongoose can compare correctly.
 */
function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    // ISO 8601 date string detection
    if (/^\d{4}-\d{2}-\d{2}T/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = reviveDates(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * GET /api/segments
 * List all segments, newest first.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const segments = await Segment.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ segments });
  } catch (error: any) {
    console.error('[Segments] GET / error:', error.message);
    res.status(500).json({ error: 'Failed to fetch segments', details: error.message });
  }
});

/**
 * GET /api/segments/:id
 * Single segment with populated customer IDs.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const segment = await Segment.findById(req.params.id)
      .populate('customerIds', 'name email city totalSpend tags engagementScore channelPreference')
      .lean();

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({ segment });
  } catch (error: any) {
    console.error('[Segments] GET /:id error:', error.message);
    res.status(500).json({ error: 'Failed to fetch segment', details: error.message });
  }
});

/**
 * POST /api/segments
 * Create a new segment from a natural language query.
 * 1. AI generates the MongoDB query
 * 2. Query is executed to find matching customers
 * 3. Segment is saved with results
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { naturalLanguageQuery } = req.body;

    if (!naturalLanguageQuery) {
      return res.status(400).json({ error: 'naturalLanguageQuery is required' });
    }

    // Gather stats for AI context
    const customerStats = await getCustomerStats();

    // Ask AI to generate the MongoDB query
    const aiResult = await generateSegmentQuery(naturalLanguageQuery, customerStats);

    // Execute the generated query
    const mongoQuery = reviveDates(aiResult.mongoQuery);
    const matchingCustomers = await Customer.find(mongoQuery).select('_id').lean();
    const customerIds = matchingCustomers.map((c: any) => c._id);

    // Create the segment
    const segment = await Segment.create({
      name: `Segment: ${naturalLanguageQuery.substring(0, 50)}`,
      description: aiResult.explanation,
      mongoQuery: JSON.stringify(aiResult.mongoQuery),
      naturalLanguageQuery,
      customerCount: customerIds.length,
      customerIds,
      aiGenerated: true,
      aiReasoning: aiResult.explanation,
    });

    res.status(201).json({
      segment,
      query: aiResult.mongoQuery,
      explanation: aiResult.explanation,
      matchCount: customerIds.length,
    });
  } catch (error: any) {
    console.error('[Segments] POST / error:', error.message);
    res.status(500).json({ error: 'Failed to create segment', details: error.message });
  }
});

let activeSuggestPromise: Promise<any[]> | null = null;
let cachedSuggestions: any[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/segments/suggest
 * AI generates 6 smart segment suggestions based on current customer data.
 */
router.post('/suggest', async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    
    // 1. If we have a resolved cache, return it
    if (cachedSuggestions && (now - lastCacheTime < CACHE_DURATION)) {
      console.log('[Segments] Returning cached smart suggestions');
      return res.json({ suggestions: cachedSuggestions });
    }

    // 2. If there is an active API request already fetching, reuse its promise
    if (activeSuggestPromise) {
      console.log('[Segments] Concurrent request detected. Awaiting active suggestions promise...');
      const suggestions = await activeSuggestPromise;
      return res.json({ suggestions });
    }

    console.log('[Segments] Fetching fresh smart suggestions from Gemini...');
    
    // Create the shared promise
    activeSuggestPromise = (async () => {
      const customerStats = await getCustomerStats();
      const suggestions = await generateSegmentSuggestions(customerStats);

      // For each suggestion, execute the query to get actual counts
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (s) => {
          try {
            const mongoQuery = reviveDates(s.mongoQuery);
            const count = await Customer.countDocuments(mongoQuery);
            return { ...s, actualCount: count };
          } catch {
            return { ...s, actualCount: 0 };
          }
        })
      );
      return enrichedSuggestions;
    })();

    // Await the shared promise
    const suggestions = await activeSuggestPromise;
    
    // Save to cache
    cachedSuggestions = suggestions;
    lastCacheTime = Date.now();
    activeSuggestPromise = null;

    res.json({ suggestions });
  } catch (error: any) {
    activeSuggestPromise = null;
    console.error('[Segments] POST /suggest error:', error.message);
    res.status(500).json({ error: 'Failed to generate suggestions', details: error.message });
  }
});

/**
 * POST /api/segments/preview
 * Preview a segment query without saving — returns the generated query and match count.
 */
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { naturalLanguageQuery } = req.body;

    if (!naturalLanguageQuery) {
      return res.status(400).json({ error: 'naturalLanguageQuery is required' });
    }

    const customerStats = await getCustomerStats();
    const aiResult = await generateSegmentQuery(naturalLanguageQuery, customerStats);

    const mongoQuery = reviveDates(aiResult.mongoQuery);
    const count = await Customer.countDocuments(mongoQuery);

    res.json({
      query: aiResult.mongoQuery,
      explanation: aiResult.explanation,
      matchCount: count,
      estimatedCount: aiResult.estimatedCount,
    });
  } catch (error: any) {
    console.error('[Segments] POST /preview error:', error.message);
    res.status(500).json({ error: 'Failed to preview segment', details: error.message });
  }
});

export default router;
