import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB, getIsMongoConnected } from './server/config/db.js';
import opportunityRoutes from './server/routes/opportunityRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import savedJobRoutes from './server/routes/savedJobRoutes.js';
import applicationRoutes from './server/routes/applicationRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';
import authRoutes from './server/routes/authRoutes.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB (MongoDB with transparent in-memory fallback)
  await connectDB();

  // Health and Diagnostic Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'NearWork API',
      database: getIsMongoConnected() ? 'MongoDB Connected' : 'In-Memory Demo Persistence Active',
      aiStatus: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? 'Gemini 3.8 Flash Ready' : 'Smart Rule-Based Engine Active (Free / Offline-Safe)',
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/opportunities', opportunityRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/saved-jobs', savedJobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/ai', aiRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NearWork] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NearWork] Failed to start server:', err);
});
