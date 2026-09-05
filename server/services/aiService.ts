import { GoogleGenAI } from '@google/genai';

export interface AIAnalysisInput {
  question?: string;
  userSkills: string[];
  userEducation?: string;
  jobTitle: string;
  jobCompany: string;
  jobCategory: string;
  jobExperience: string;
  jobDescription: string;
  jobSkills: string[];
}

export interface AIAnalysisOutput {
  matchScore: number;
  whyItMatches: string;
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
  interviewPreparation: string[];
  suitabilitySummary: string;
  mode: 'gemini' | 'rule-based';
}

/**
 * Smart Rule-Based Fallback Assistant
 * Computes deterministic, high-quality match analysis without requiring an external API key.
 */
export function generateRuleBasedAnalysis(input: AIAnalysisInput): AIAnalysisOutput {
  const userSkillsNorm = (input.userSkills || []).map(s => s.toLowerCase().trim());
  const jobSkillsNorm = (input.jobSkills || []).map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  jobSkillsNorm.forEach((skill, idx) => {
    const originalSkill = input.jobSkills[idx] || skill;
    if (userSkillsNorm.includes(skill)) {
      matched.push(originalSkill);
    } else {
      missing.push(originalSkill);
    }
  });

  const totalRequired = Math.max(jobSkillsNorm.length, 1);
  const matchPercentage = Math.round((matched.length / totalRequired) * 100);

  // Recommendations based on missing skills and category
  const recommendations: string[] = [];
  if (missing.length > 0) {
    missing.forEach(skill => {
      if (['git', 'github'].includes(skill.toLowerCase())) {
        recommendations.push(`Learn Git fundamentals: commits, branching, pull requests, and merge conflict resolution.`);
      } else if (['python', 'java', 'javascript'].includes(skill.toLowerCase())) {
        recommendations.push(`Review core syntax, data structures (arrays/objects/lists), and clean coding paradigms in ${skill}.`);
      } else if (['sql', 'mongodb'].includes(skill.toLowerCase())) {
        recommendations.push(`Practice writing database queries, schema design, and relational joins or aggregation pipelines with ${skill}.`);
      } else if (['react', 'node.js'].includes(skill.toLowerCase())) {
        recommendations.push(`Build a small weekend full-stack or component-driven project with ${skill}.`);
      } else if (['excel'].includes(skill.toLowerCase())) {
        recommendations.push(`Master VLOOKUP/XLOOKUP, Pivot Tables, and statistical charting in Excel.`);
      } else {
        recommendations.push(`Review fundamental documentation and build a quick prototype using ${skill}.`);
      }
    });
  } else {
    recommendations.push(`You meet all listed technical requirements! Strengthen your project portfolio and link code repositories.`);
    recommendations.push(`Prepare concise walkthroughs of projects on your resume where you applied ${matched.slice(0, 2).join(' and ')}.`);
  }

  // Interview preparation questions/topics
  const interviewPreparation: string[] = [];
  if (matched.length > 0) {
    interviewPreparation.push(`Core knowledge of ${matched.join(', ')} (syntax, common patterns, problem solving).`);
  }
  if (missing.length > 0) {
    interviewPreparation.push(`Basic conceptual understanding of ${missing.join(', ')} to show learning agility during technical rounds.`);
  }
  interviewPreparation.push(`Project walkthrough: Describe an end-to-end technical challenge you solved using your core skills.`);
  interviewPreparation.push(`Behavioral: Prepare examples of adaptability, teamwork, and passion for joining ${input.jobCompany}.`);

  // Tailored suitability text
  let whyItMatches = '';
  if (matched.length > 0) {
    whyItMatches = `You already possess proficiency in ${matched.join(', ')}, satisfying ${matchPercentage}% of the core technical requirements for ${input.jobTitle} at ${input.jobCompany}.`;
  } else {
    whyItMatches = `While you have foundational knowledge in ${input.userSkills.join(', ')}, this role focuses heavily on ${input.jobSkills.join(', ')}. Acquiring initial exposure will significantly boost your profile.`;
  }

  // Specific answer based on question prompt
  const q = (input.question || '').toLowerCase();
  let suitabilitySummary = '';

  if (q.includes('why is this job suitable') || q.includes('good match') || q.includes('suitable for me')) {
    suitabilitySummary = matchPercentage >= 60
      ? `This role is a solid match (${matchPercentage}% alignment). Your background in ${matched.join(', ')} allows you to contribute immediately to ${input.jobCompany}'s ${input.jobCategory} initiatives.`
      : `This opportunity offers high learning potential. You have ${matchPercentage}% direct overlap, and bridging gaps in ${missing.join(', ') || 'specialized tools'} will make you highly competitive.`;
  } else if (q.includes('missing') || q.includes('skills')) {
    suitabilitySummary = missing.length > 0
      ? `The primary skill gaps to bridge are: ${missing.join(', ')}. Dedicating a few days to targeted practice will prepare you for application screening.`
      : `Great news! You have no missing skill requirements based on your saved profile.`;
  } else if (q.includes('learn') || q.includes('before applying')) {
    suitabilitySummary = missing.length > 0
      ? `Focus first on ${missing[0]} and practical hands-on examples. Showing ongoing learning in your cover note or interview is valued by recruiters.`
      : `Prioritize polishing your GitHub repositories or live project demo links for your ${matched.join(' and ')} projects.`;
  } else if (q.includes('interview') || q.includes('prepare')) {
    suitabilitySummary = `Focus interview prep on live coding and explaining past projects with ${matched.join(' & ')}, plus fundamental concepts of ${input.jobCategory}.`;
  } else {
    suitabilitySummary = `Based on your profile, you have a ${matchPercentage}% match for this ${input.jobTitle} opportunity. Follow the recommendations below to maximize your interview readiness.`;
  }

  return {
    matchScore: matchPercentage,
    whyItMatches,
    strengths: matched.length > 0 ? matched : ['Foundational analytical abilities', 'Willingness to learn'],
    skillGaps: missing,
    recommendations,
    interviewPreparation,
    suitabilitySummary,
    mode: 'rule-based'
  };
}

/**
 * Gemini AI analysis with automatic graceful fallback
 */
export async function analyzeOpportunityMatch(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return generateRuleBasedAnalysis(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are NearWork Smart Assistant, an encouraging and pragmatic career coach for college students and entry-level job seekers.
Analyze the following student profile against the job opportunity:

STUDENT PROFILE:
- Skills: ${input.userSkills.join(', ') || 'None specified'}
- Education: ${input.userEducation || 'Undergraduate'}

JOB OPPORTUNITY:
- Title: ${input.jobTitle}
- Company: ${input.jobCompany}
- Category: ${input.jobCategory}
- Experience Level: ${input.jobExperience}
- Required Skills: ${input.jobSkills.join(', ')}
- Description: ${input.jobDescription}

USER QUESTION / PROMPT:
"${input.question || 'Provide a comprehensive match breakdown and advice'}"

Respond strictly with a JSON object matching this exact TypeScript structure:
{
  "matchScore": number (integer between 0 and 100),
  "whyItMatches": string (concise explanation of why they match),
  "strengths": string[] (user skills or assets that directly benefit this job),
  "skillGaps": string[] (skills required by the job that the user lacks),
  "recommendations": string[] (2-4 concrete, actionable learning recommendations),
  "interviewPreparation": string[] (3-4 specific technical or behavioral topics to practice),
  "suitabilitySummary": string (direct, friendly 2-sentence response directly answering the user question)
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim();
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return {
        matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 75,
        whyItMatches: parsed.whyItMatches || 'Good alignment with current skills.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        interviewPreparation: Array.isArray(parsed.interviewPreparation) ? parsed.interviewPreparation : [],
        suitabilitySummary: parsed.suitabilitySummary || 'You are well positioned for this opportunity.',
        mode: 'gemini'
      };
    }
    return generateRuleBasedAnalysis(input);
  } catch (err: any) {
    console.warn('[NearWork AI Service] Gemini API call was unavailable or encountered an error:', err?.message || err);
    console.log('[NearWork AI Service] Serving reliable rule-based analysis fallback.');
    return generateRuleBasedAnalysis(input);
  }
}
