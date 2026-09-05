import { Router, Request, Response } from 'express';
import Opportunity from '../models/Opportunity.js';
import { memoryStore } from '../store/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';
import { getRealTimeJobs } from '../services/realTimeJobService.js';

const router = Router();

// GET /api/opportunities/live - Dedicated real-time live job feed
router.get('/live', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const { search, category, type, skill, location } = req.query as Record<string, string>;

    let liveJobs = await getRealTimeJobs(forceRefresh);

    // Apply client filters if provided
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      liveJobs = liveJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      liveJobs = liveJobs.filter((j) => j.category.toLowerCase() === category.toLowerCase());
    }

    if (type && type !== 'All') {
      liveJobs = liveJobs.filter((j) => j.type.toLowerCase() === type.toLowerCase());
    }

    if (location && location !== 'All') {
      liveJobs = liveJobs.filter((j) =>
        j.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (skill && skill !== 'All') {
      liveJobs = liveJobs.filter((j) =>
        j.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
      );
    }

    return res.json({
      count: liveJobs.length,
      data: liveJobs,
      source: 'live_web_feed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/opportunities/live:', error);
    return res.status(500).json({
      message: 'Failed to fetch real-time jobs',
      error: error.message,
      data: []
    });
  }
});

// GET /api/opportunities/search - Dedicated search endpoint
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || req.query.search as string || '').trim();
    if (!getIsMongoConnected()) {
      const results = memoryStore.getOpportunities({ search: q });
      return res.json({ count: results.length, data: results });
    }

    const queryFilter = q
      ? {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { company: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
          ],
        }
      : {};

    const opportunities = await (Opportunity as any).find(queryFilter).sort({ createdAt: -1 });
    return res.json({ count: opportunities.length, data: opportunities });
  } catch (error: any) {
    console.error('Error searching opportunities:', error);
    return res.status(500).json({ message: 'Error searching opportunities', error: error.message });
  }
});

// GET /api/opportunities - Filter and list opportunities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, location, category, type, skill, source } = req.query as Record<string, string>;

    // If only live jobs are requested
    if (source === 'live') {
      let liveJobs = await getRealTimeJobs(false);
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        liveJobs = liveJobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (category && category !== 'All') {
        liveJobs = liveJobs.filter((j) => j.category.toLowerCase() === category.toLowerCase());
      }
      if (type && type !== 'All') {
        liveJobs = liveJobs.filter((j) => j.type.toLowerCase() === type.toLowerCase());
      }
      if (skill && skill !== 'All') {
        liveJobs = liveJobs.filter((j) => j.skills.some((s) => s.toLowerCase() === skill.toLowerCase()));
      }
      return res.json({ count: liveJobs.length, data: liveJobs, source: 'live' });
    }

    let opportunities: any[] = [];

    if (!getIsMongoConnected()) {
      opportunities = memoryStore.getOpportunities({ search, location, category, type, skill });
    } else {
      const mongoFilter: any = {};

      if (search && search.trim()) {
        const q = search.trim();
        mongoFilter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
        ];
      }

      if (location && location !== 'All') {
        mongoFilter.location = { $regex: `^${location}$`, $options: 'i' };
      }

      if (category && category !== 'All') {
        mongoFilter.category = { $regex: `^${category}$`, $options: 'i' };
      }

      if (type && type !== 'All') {
        mongoFilter.type = { $regex: `^${type}$`, $options: 'i' };
      }

      if (skill && skill !== 'All') {
        mongoFilter.skills = { $in: [new RegExp(`^${skill}$`, 'i')] };
      }

      opportunities = await (Opportunity as any).find(mongoFilter).sort({ createdAt: -1 });
    }

    // If source === 'all', also append live jobs matching criteria
    if (source === 'all') {
      try {
        const liveJobs = await getRealTimeJobs(false);
        const filteredLive = liveJobs.filter((j) => {
          if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            const match =
              j.title.toLowerCase().includes(q) ||
              j.company.toLowerCase().includes(q) ||
              j.skills.some((s) => s.toLowerCase().includes(q));
            if (!match) return false;
          }
          if (category && category !== 'All' && j.category.toLowerCase() !== category.toLowerCase()) {
            return false;
          }
          if (type && type !== 'All' && j.type.toLowerCase() !== type.toLowerCase()) {
            return false;
          }
          if (skill && skill !== 'All' && !j.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
            return false;
          }
          return true;
        });
        opportunities = [...opportunities, ...filteredLive];
      } catch (e) {
        console.warn('Could not append live jobs:', e);
      }
    }

    return res.json({ count: opportunities.length, data: opportunities });
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    const fallbackResults = memoryStore.getOpportunities(req.query as any);
    return res.json({ count: fallbackResults.length, data: fallbackResults });
  }
});

// GET /api/opportunities/:id - Get single opportunity
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if it's a real-time live job
    if (id.startsWith('live-')) {
      const liveJobs = await getRealTimeJobs(false);
      const liveOpp = liveJobs.find((j) => j._id === id || j.id === id);
      if (liveOpp) return res.json(liveOpp);
    }

    if (!getIsMongoConnected()) {
      const opp = memoryStore.getOpportunityById(id);
      if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
      return res.json(opp);
    }

    // Try finding by ObjectId or by custom ID field
    let opp = null;
    try {
      opp = await (Opportunity as any).findById(id);
    } catch {
      // not a valid ObjectId, search by title or in-memory
    }

    if (!opp) {
      opp = memoryStore.getOpportunityById(id);
    }

    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    return res.json(opp);
  } catch (error: any) {
    console.error('Error fetching opportunity by ID:', error);
    const fallback = memoryStore.getOpportunityById(req.params.id);
    if (fallback) return res.json(fallback);
    return res.status(500).json({ message: 'Error retrieving opportunity', error: error.message });
  }
});

// POST /api/opportunities - Add new opportunity
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title || !data.company || !data.location || !data.category) {
      return res.status(400).json({ message: 'Missing required opportunity fields' });
    }

    if (!getIsMongoConnected()) {
      const created = memoryStore.createOpportunity(data);
      return res.status(201).json(created);
    }

    const opportunity = new Opportunity(data);
    await opportunity.save();
    return res.status(201).json(opportunity);
  } catch (error: any) {
    console.error('Error creating opportunity:', error);
    return res.status(500).json({ message: 'Failed to create opportunity', error: error.message });
  }
});

export default router;
