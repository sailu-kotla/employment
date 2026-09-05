import {
  Opportunity,
  UserProfile,
  SavedJob,
  Application,
  DashboardStats,
  AIAnalysisResult,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials
} from '../types.ts';

const API_BASE = '/api';

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function fetchDemoCredentials(): Promise<{ email: string; password: string; name: string }> {
  const res = await fetch(`${API_BASE}/auth/demo`);
  if (!res.ok) return { email: 'kotlasailaja2006@gmail.com', password: 'password123', name: 'Sailaja Kotla' };
  return res.json();
}

export async function fetchHealth(): Promise<{
  status: string;
  database: string;
  aiStatus: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      database: 'In-Memory Fallback',
      aiStatus: 'Smart Rule-Based Engine Active',
    };
  }
}

export async function fetchOpportunities(filters?: {
  search?: string;
  location?: string;
  category?: string;
  type?: string;
  skill?: string;
  source?: 'curated' | 'live' | 'all';
}): Promise<{ count: number; data: Opportunity[] }> {
  const query = new URLSearchParams();
  if (filters?.search) query.append('search', filters.search);
  if (filters?.location && filters.location !== 'All') query.append('location', filters.location);
  if (filters?.category && filters.category !== 'All') query.append('category', filters.category);
  if (filters?.type && filters.type !== 'All') query.append('type', filters.type);
  if (filters?.skill && filters.skill !== 'All') query.append('skill', filters.skill);
  if (filters?.source) query.append('source', filters.source);

  const res = await fetch(`${API_BASE}/opportunities?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch opportunities');
  return res.json();
}

export async function fetchLiveOpportunities(filters?: {
  search?: string;
  category?: string;
  type?: string;
  skill?: string;
  location?: string;
  refresh?: boolean;
}): Promise<{ count: number; data: Opportunity[]; source: string; timestamp?: string }> {
  const query = new URLSearchParams();
  if (filters?.search) query.append('search', filters.search);
  if (filters?.category && filters.category !== 'All') query.append('category', filters.category);
  if (filters?.type && filters.type !== 'All') query.append('type', filters.type);
  if (filters?.skill && filters.skill !== 'All') query.append('skill', filters.skill);
  if (filters?.location && filters.location !== 'All') query.append('location', filters.location);
  if (filters?.refresh) query.append('refresh', 'true');

  const res = await fetch(`${API_BASE}/opportunities/live?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch live real-time opportunities');
  return res.json();
}

export async function fetchOpportunityById(id: string): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/opportunities/${id}`);
  if (!res.ok) throw new Error('Opportunity not found');
  return res.json();
}

export async function fetchUserProfile(userId = 'user-default-1'): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<{ message: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save profile');
  return data;
}

export async function fetchSavedJobs(userId = 'user-default-1'): Promise<SavedJob[]> {
  const res = await fetch(`${API_BASE}/saved-jobs/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch saved jobs');
  return res.json();
}

export async function toggleSaveJob(userId: string, opportunityId: string): Promise<{ saved: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/saved-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, opportunityId }),
  });
  if (!res.ok) throw new Error('Failed to toggle save status');
  return res.json();
}

export async function removeSavedJob(id: string, userId = 'user-default-1'): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/saved-jobs/${id}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete saved job');
  return res.json();
}

export async function fetchApplications(userId = 'user-default-1'): Promise<{
  applications: Application[];
  stats: DashboardStats;
}> {
  const res = await fetch(`${API_BASE}/applications/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function applyToOpportunity(
  userId: string,
  opportunityId: string,
  status: Application['status'] = 'Applied'
): Promise<{ message: string; application: Application }> {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, opportunityId, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit application');
  return data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
): Promise<{ message: string; application: Application }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update application');
  return data;
}

export async function queryAIAssistant(payload: {
  question?: string;
  userSkills: string[];
  userEducation?: string;
  jobTitle: string;
  jobCompany: string;
  jobCategory: string;
  jobExperience: string;
  jobDescription: string;
  jobSkills: string[];
}): Promise<AIAnalysisResult> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'AI assistant request failed');
  }
  return res.json();
}
