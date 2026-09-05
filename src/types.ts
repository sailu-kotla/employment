export type EmploymentType = 'Internship' | 'Full-time' | 'Part-time' | 'Apprenticeship';

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected';

export interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  education: string;
  skills: string[];
  preferredLocation: string;
  preferredCategory: string;
  token?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: UserProfile;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  education?: string;
  skills?: string[];
  preferredLocation?: string;
  preferredCategory?: string;
}

export interface Opportunity {
  _id: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: EmploymentType;
  skills: string[];
  salary: string;
  experience: string;
  eligibility: string;
  description: string;
  deadline: string;
  applyLink: string;
  createdAt: string;
  featured?: boolean;
  isLive?: boolean;
  source?: string;
  companyLogo?: string;
}

export interface SavedJob {
  _id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  createdAt: string;
}

export interface Application {
  _id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SkillMatchResult {
  matchPercentage: number;
  ratingCategory: 'Excellent Match' | 'Good Match' | 'Partial Match' | 'Low Match';
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
}

export interface AIAnalysisResult {
  matchScore: number;
  whyItMatches: string;
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
  interviewPreparation: string[];
  suitabilitySummary?: string;
  mode: 'gemini' | 'rule-based';
}

export interface DashboardStats {
  saved: number;
  applied: number;
  interview: number;
  selected: number;
  rejected: number;
}
