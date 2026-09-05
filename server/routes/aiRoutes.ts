import { Router, Request, Response } from 'express';
import { analyzeOpportunityMatch } from '../services/aiService.js';

const router = Router();

// POST /api/ai/analyze - NearWork Smart Assistant
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const {
      question,
      userSkills = [],
      userEducation = 'Undergraduate',
      jobTitle,
      jobCompany,
      jobCategory,
      jobExperience = 'Fresher',
      jobDescription,
      jobSkills = []
    } = req.body;

    if (!jobTitle || !jobCompany) {
      return res.status(400).json({ message: 'jobTitle and jobCompany are required for analysis.' });
    }

    const result = await analyzeOpportunityMatch({
      question,
      userSkills,
      userEducation,
      jobTitle,
      jobCompany,
      jobCategory: jobCategory || 'General',
      jobExperience,
      jobDescription: jobDescription || '',
      jobSkills
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in AI analysis route:', error);
    // Never crash or return raw technical errors
    return res.status(500).json({
      message: 'AI assistant is temporarily unavailable. Showing basic recommendations instead.',
      error: error.message
    });
  }
});

export default router;
