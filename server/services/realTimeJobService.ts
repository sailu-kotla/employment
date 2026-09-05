// server/services/realTimeJobService.ts
// Real-time job feed integration for live external job postings

export interface LiveJob {
  _id: string;
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: 'Internship' | 'Full-time' | 'Part-time' | 'Apprenticeship';
  skills: string[];
  salary: string;
  experience: string;
  eligibility: string;
  description: string;
  deadline: string;
  applyLink: string;
  createdAt: string;
  featured: boolean;
  isLive: boolean;
  source: string;
  companyLogo?: string;
}

// In-memory cache for live jobs to prevent rate-limiting and ensure instant response
let cachedLiveJobs: LiveJob[] = [];
let lastFetchedTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Fetch live jobs from Remotive API
 */
async function fetchRemotiveJobs(): Promise<LiveJob[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=25', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NearWork-Job-Aggregator/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[LiveJobService] Remotive returned status ${res.status}`);
      return [];
    }

    const data: any = await res.json();
    if (!data.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any): LiveJob => {
      // Determine employment type
      let type: 'Internship' | 'Full-time' | 'Part-time' | 'Apprenticeship' = 'Full-time';
      if (job.job_type === 'internship') type = 'Internship';
      else if (job.job_type === 'part_time') type = 'Part-time';

      // Extract skills from tags or title
      const extractedSkills = Array.isArray(job.tags) && job.tags.length > 0
        ? job.tags.slice(0, 6)
        : ['JavaScript', 'Web Development', 'Git'];

      const cleanedDesc = cleanHtml(job.description);

      return {
        _id: `live-remotive-${job.id}`,
        id: `live-remotive-${job.id}`,
        title: job.title || 'Software Engineer',
        company: job.company_name || 'Tech Organization',
        location: job.candidate_required_location || 'Remote (Worldwide)',
        category: 'Software Development',
        type,
        skills: extractedSkills,
        salary: job.salary ? job.salary : 'Competitive compensation (Verified in live posting)',
        experience: job.title.toLowerCase().includes('senior') ? 'Experienced' : 'Fresher / Entry Level / 0-2 Years',
        eligibility: 'Open to fresh graduates & self-taught developers',
        description: cleanedDesc.slice(0, 600) + (cleanedDesc.length > 600 ? '...' : ''),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applyLink: job.url,
        createdAt: job.publication_date || new Date().toISOString(),
        featured: false,
        isLive: true,
        source: 'Remotive Live Job Feed',
        companyLogo: job.company_logo_url || undefined
      };
    });
  } catch (err: any) {
    console.warn('[LiveJobService] Failed to fetch from Remotive:', err.message);
    return [];
  }
}

/**
 * Fetch live jobs from Jobicy API
 */
async function fetchJobicyJobs(): Promise<LiveJob[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20&tag=developer', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NearWork-Job-Aggregator/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[LiveJobService] Jobicy returned status ${res.status}`);
      return [];
    }

    const data: any = await res.json();
    if (!data.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any): LiveJob => {
      let type: 'Internship' | 'Full-time' | 'Part-time' | 'Apprenticeship' = 'Full-time';
      if (job.jobType?.toLowerCase().includes('intern')) type = 'Internship';
      else if (job.jobType?.toLowerCase().includes('part')) type = 'Part-time';

      const cleanedDesc = cleanHtml(job.jobDescription);

      // Extract skills from tags or description
      const tags = Array.isArray(job.jobTags) ? job.jobTags.slice(0, 5) : [];
      const skills = tags.length > 0 ? tags : ['Software Engineering', 'APIs', 'Git', 'Problem Solving'];

      return {
        _id: `live-jobicy-${job.id}`,
        id: `live-jobicy-${job.id}`,
        title: job.jobTitle || 'Developer',
        company: job.companyName || 'Global Hiring Partner',
        location: job.jobGeo || 'Remote / Worldwide',
        category: job.jobIndustry?.[0] || 'Software Development',
        type,
        skills,
        salary: job.annualSalaryMin && job.annualSalaryMax
          ? `$${job.annualSalaryMin.toLocaleString()} - $${job.annualSalaryMax.toLocaleString()} / year`
          : 'Competitive compensation (Verified on portal)',
        experience: job.jobLevel || 'Entry Level / Associate',
        eligibility: 'Open to fresh graduates and junior engineers',
        description: cleanedDesc.slice(0, 600) + (cleanedDesc.length > 600 ? '...' : ''),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applyLink: job.url,
        createdAt: job.pubDate || new Date().toISOString(),
        featured: false,
        isLive: true,
        source: 'Jobicy Live Feed',
        companyLogo: job.companyLogo || undefined
      };
    });
  } catch (err: any) {
    console.warn('[LiveJobService] Failed to fetch from Jobicy:', err.message);
    return [];
  }
}

/**
 * Fetch and combine all real-time jobs
 */
export async function getRealTimeJobs(forceRefresh = false): Promise<LiveJob[]> {
  const now = Date.now();
  if (!forceRefresh && cachedLiveJobs.length > 0 && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedLiveJobs;
  }

  console.log('[LiveJobService] Fetching fresh real-time jobs from live feeds...');

  // Fetch in parallel
  const [remotiveJobs, jobicyJobs] = await Promise.all([
    fetchRemotiveJobs(),
    fetchJobicyJobs()
  ]);

  const combined = [...remotiveJobs, ...jobicyJobs];

  // Remove duplicates if any
  const seenIds = new Set<string>();
  const uniqueJobs: LiveJob[] = [];

  for (const job of combined) {
    if (!seenIds.has(job.applyLink)) {
      seenIds.add(job.applyLink);
      uniqueJobs.push(job);
    }
  }

  if (uniqueJobs.length > 0) {
    cachedLiveJobs = uniqueJobs;
    lastFetchedTime = now;
    console.log(`[LiveJobService] Successfully fetched ${uniqueJobs.length} live jobs.`);
  } else if (cachedLiveJobs.length > 0) {
    console.log('[LiveJobService] Live feed empty, returning cached live jobs.');
  }

  return cachedLiveJobs;
}
