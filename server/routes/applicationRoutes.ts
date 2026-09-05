import { Router, Request, Response } from 'express';
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import { memoryStore } from '../store/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const router = Router();

// GET /api/applications or /api/applications/:userId - Get applications and summary statistics for a user
router.get('/', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-default-1';
  return fetchUserApplications(userId, req, res);
});

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  return fetchUserApplications(userId, req, res);
});

async function fetchUserApplications(userId: string, req: Request, res: Response) {
  try {
    let apps: any[] = [];

    if (!getIsMongoConnected()) {
      apps = memoryStore.getApplications(userId);
    } else {
      const records = await (Application as any).find({ userId }).sort({ updatedAt: -1 });
      apps = await Promise.all(
        records.map(async (record: any) => {
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
            status: record.status,
            appliedAt: record.appliedAt,
            updatedAt: record.updatedAt,
            opportunity: opp
          };
        })
      );
    }

    // Calculate statistics
    const stats = {
      saved: 0,
      applied: 0,
      interview: 0,
      selected: 0,
      rejected: 0
    };

    apps.forEach(a => {
      const statusKey = (a.status || '').toLowerCase() as keyof typeof stats;
      if (stats[statusKey] !== undefined) {
        stats[statusKey]++;
      }
    });

    return res.json({
      applications: apps,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    const fallbackApps = memoryStore.getApplications(userId);
    const stats = {
      saved: fallbackApps.filter(a => a.status === 'Saved').length,
      applied: fallbackApps.filter(a => a.status === 'Applied').length,
      interview: fallbackApps.filter(a => a.status === 'Interview').length,
      selected: fallbackApps.filter(a => a.status === 'Selected').length,
      rejected: fallbackApps.filter(a => a.status === 'Rejected').length,
    };
    return res.json({ applications: fallbackApps, stats });
  }
}

// POST /api/applications - Submit an application or move to tracker
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, opportunityId, status = 'Applied' } = req.body;
    if (!userId || !opportunityId) {
      return res.status(400).json({ message: 'userId and opportunityId are required' });
    }

    if (!getIsMongoConnected()) {
      const app = memoryStore.createOrUpdateApplication(userId, opportunityId, status);
      return res.status(201).json({ message: 'Application recorded successfully', application: app });
    }

    let application = await (Application as any).findOne({ userId, opportunityId });
    if (application) {
      application.status = status;
      application.updatedAt = new Date();
      await application.save();
    } else {
      application = await (Application as any).create({
        userId,
        opportunityId,
        status,
        appliedAt: new Date(),
        updatedAt: new Date()
      });
    }

    memoryStore.createOrUpdateApplication(userId, opportunityId, status);

    return res.status(201).json({ message: 'Application recorded successfully', application });
  } catch (error: any) {
    console.error('Error creating application:', error);
    const app = memoryStore.createOrUpdateApplication(req.body.userId, req.body.opportunityId, req.body.status || 'Applied');
    return res.status(201).json({ message: 'Application recorded successfully', application: app });
  }
});

// PUT /api/applications/:id - Update status (Saved, Applied, Interview, Selected, Rejected)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Saved', 'Applied', 'Interview', 'Selected', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    if (!getIsMongoConnected()) {
      const updated = memoryStore.updateApplicationStatus(id, status);
      return res.json({ message: 'Status updated successfully', application: updated });
    }

    let application = null;
    try {
      application = await (Application as any).findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      );
    } catch {
      // not a mongo ObjectId
    }

    if (!application) {
      application = memoryStore.updateApplicationStatus(id, status);
    } else {
      memoryStore.updateApplicationStatus(id, status);
    }

    return res.json({ message: 'Status updated successfully', application });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    const updated = memoryStore.updateApplicationStatus(req.params.id, req.body.status);
    return res.json({ message: 'Status updated successfully', application: updated });
  }
});

export default router;
