import { Router, Request, Response } from 'express';
import SavedJob from '../models/SavedJob.js';
import Opportunity from '../models/Opportunity.js';
import { memoryStore } from '../store/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const router = Router();

// GET /api/saved-jobs or /api/saved-jobs/:userId - Get all saved jobs for a user
router.get('/', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-default-1';
  return fetchUserSavedJobs(userId, req, res);
});

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  return fetchUserSavedJobs(userId, req, res);
});

async function fetchUserSavedJobs(userId: string, req: Request, res: Response) {
  try {
    if (!getIsMongoConnected()) {
      const saved = memoryStore.getSavedJobs(userId);
      return res.json(saved);
    }

    const savedRecords = await (SavedJob as any).find({ userId }).sort({ createdAt: -1 });
    const result = await Promise.all(
      savedRecords.map(async (record: any) => {
        let opp = null;
        try {
          opp = await (Opportunity as any).findById(record.opportunityId);
        } catch {}
        if (!opp) {
          opp = memoryStore.getOpportunityById(record.opportunityId);
        }
        return {
          _id: record._id,
          userId: record.userId,
          opportunityId: record.opportunityId,
          createdAt: record.createdAt,
          opportunity: opp
        };
      })
    );

    return res.json(result);
  } catch (error: any) {
    console.error('Error getting saved jobs:', error);
    const fallback = memoryStore.getSavedJobs(userId);
    return res.json(fallback);
  }
}

// POST /api/saved-jobs - Toggle or save opportunity
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, opportunityId } = req.body;
    if (!userId || !opportunityId) {
      return res.status(400).json({ message: 'userId and opportunityId are required' });
    }

    if (!getIsMongoConnected()) {
      const result = memoryStore.toggleSaveJob(userId, opportunityId);
      return res.json(result);
    }

    const existing = await (SavedJob as any).findOne({ userId, opportunityId });
    if (existing) {
      await (SavedJob as any).deleteOne({ _id: existing._id });
      // sync memoryStore
      memoryStore.deleteSavedJob(opportunityId, userId);
      return res.json({ saved: false, message: 'Opportunity removed from saved list' });
    } else {
      const newSaved = await (SavedJob as any).create({ userId, opportunityId });
      // sync memoryStore
      memoryStore.toggleSaveJob(userId, opportunityId);
      return res.json({ saved: true, savedJob: newSaved, message: 'Opportunity saved successfully' });
    }
  } catch (error: any) {
    console.error('Error saving job:', error);
    const result = memoryStore.toggleSaveJob(req.body.userId, req.body.opportunityId);
    return res.json(result);
  }
});

// DELETE /api/saved-jobs/:id - Delete saved job
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query as { userId?: string };

    if (!getIsMongoConnected()) {
      memoryStore.deleteSavedJob(id, userId);
      return res.json({ message: 'Saved opportunity removed' });
    }

    try {
      await (SavedJob as any).findByIdAndDelete(id);
    } catch {
      if (userId) {
        await (SavedJob as any).deleteOne({ userId, opportunityId: id });
      }
    }
    memoryStore.deleteSavedJob(id, userId);
    return res.json({ message: 'Saved opportunity removed' });
  } catch (error: any) {
    console.error('Error deleting saved job:', error);
    memoryStore.deleteSavedJob(req.params.id, req.query.userId as string);
    return res.json({ message: 'Saved opportunity removed' });
  }
});

export default router;
