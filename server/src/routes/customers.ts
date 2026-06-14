import { Router, Request, Response } from 'express';
import Customer from '../models/Customer';
import Order from '../models/Order';

const router = Router();

/**
 * GET /api/customers
 * List customers with pagination, search, and filtering.
 *
 * Query params:
 *   page   — page number (default 1)
 *   limit  — results per page (default 20, max 100)
 *   search — text search across name, email, phone
 *   city   — filter by city
 *   tags   — comma-separated tag filter (e.g. "loyalist,new")
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string;
    const city = req.query.city as string;
    const tags = req.query.tags as string;
    const sortParam = req.query.sort as string;
    const channel = req.query.channel as string;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) {
      filter.city = city;
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    if (channel && channel !== 'all') {
      filter.channelPreference = channel;
    }

    let sortOption: any = { createdAt: -1 };
    if (sortParam === 'spend_desc') sortOption = { totalSpend: -1 };
    else if (sortParam === 'engagement_desc') sortOption = { engagementScore: -1 };
    else if (sortParam === 'recent') sortOption = { lastOrderDate: -1 };

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Customers] GET / error:', error.message);
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
});

/**
 * GET /api/customers/stats
 * Aggregate customer statistics for the AI service and dashboard.
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      totalCustomers,
      spendAgg,
      cityBreakdown,
      tagBreakdown,
      spendDistribution,
      dateRange,
    ] = await Promise.all([
      Customer.countDocuments(),

      // Average spend and total revenue
      Customer.aggregate([
        {
          $group: {
            _id: null,
            avgSpend: { $avg: '$totalSpend' },
            totalRevenue: { $sum: '$totalSpend' },
            avgOrderValue: { $avg: '$averageOrderValue' },
            maxSpend: { $max: '$totalSpend' },
            minSpend: { $min: '$totalSpend' },
          },
        },
      ]),

      // Customers per city
      Customer.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 }, avgSpend: { $avg: '$totalSpend' } } },
        { $sort: { count: -1 } },
      ]),

      // Tag distribution
      Customer.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Spend distribution buckets
      Customer.aggregate([
        {
          $bucket: {
            groupBy: '$totalSpend',
            boundaries: [0, 500, 1000, 2000, 5000, 10000, 50000],
            default: '50000+',
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      // Date range of orders
      Customer.aggregate([
        {
          $group: {
            _id: null,
            earliestOrder: { $min: '$firstOrderDate' },
            latestOrder: { $max: '$lastOrderDate' },
          },
        },
      ]),
    ]);

    const spend = spendAgg[0] || {
      avgSpend: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      maxSpend: 0,
      minSpend: 0,
    };
    const dates = dateRange[0] || { earliestOrder: null, latestOrder: null };

    res.json({
      totalCustomers,
      avgSpend: Math.round(spend.avgSpend || 0),
      totalRevenue: Math.round(spend.totalRevenue || 0),
      avgOrderValue: Math.round(spend.avgOrderValue || 0),
      maxSpend: spend.maxSpend || 0,
      minSpend: spend.minSpend || 0,
      cityBreakdown: cityBreakdown.map((c: any) => ({
        city: c._id,
        count: c.count,
        avgSpend: Math.round(c.avgSpend),
      })),
      tagBreakdown: tagBreakdown.map((t: any) => ({
        tag: t._id,
        count: t.count,
      })),
      spendDistribution: spendDistribution.map((b: any) => ({
        range: b._id === '50000+' ? '₹50,000+' : `₹${b._id}`,
        count: b.count,
      })),
      dateRange: {
        earliest: dates.earliestOrder,
        latest: dates.latestOrder,
      },
    });
  } catch (error: any) {
    console.error('[Customers] GET /stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch customer stats', details: error.message });
  }
});

/**
 * GET /api/customers/:id
 * Single customer with their order history.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = await Order.find({ customerId: customer._id })
      .sort({ orderDate: -1 })
      .lean();

    res.json({ customer, orders });
  } catch (error: any) {
    console.error('[Customers] GET /:id error:', error.message);
    res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
  }
});

/**
 * POST /api/customers/bulk
 * Bulk import an array of customers.
 */
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const customers = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of customers' });
    }

    const result = await Customer.insertMany(customers, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${result.length} customers`,
      count: result.length,
    });
  } catch (error: any) {
    // insertMany with ordered:false continues on error — report partial success
    if (error.insertedDocs) {
      return res.status(207).json({
        message: `Partially imported ${error.insertedDocs.length} customers`,
        count: error.insertedDocs.length,
        errors: error.writeErrors?.length || 0,
      });
    }
    console.error('[Customers] POST /bulk error:', error.message);
    res.status(500).json({ error: 'Failed to bulk import customers', details: error.message });
  }
});

export default router;
