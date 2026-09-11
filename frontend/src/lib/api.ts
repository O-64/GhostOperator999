import {
  ActiveUser,
  Application,
  CandidateUser,
  CopilotMessage,
  JobPosting,
  MatchResult,
  PipelineStage,
  RecruiterUser,
} from '../types';
import { tokenStorage } from './tokenStorage';

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000/v1`;
  }
  return process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/v1` : 'http://127.0.0.1:8000/v1';
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function parseErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === 'object' && first && 'msg' in first) {
      return String((first as { msg: string }).msg);
    }
  }
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiUrl = getApiUrl();
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      0,
      `Cannot reach the backend at ${apiUrl}. Start the API server on port 8000: cd src/nodejs-backend && npm run dev`
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, parseErrorMessage(body, res.statusText));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: ActiveUser;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginCandidate(email: string, password: string): Promise<ActiveUser> {
  const data = await request<TokenResponse>('/auth/candidate/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  tokenStorage.set(data.access_token);
  return data.user;
}

export async function signupCandidate(payload: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  experienceType: 'fresher' | 'experienced';
  previousCompany?: string;
  currentCompany?: string;
  reasonForChange?: string;
  post?: string;
}): Promise<ActiveUser> {
  const data = await request<TokenResponse>('/auth/candidate/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      password: payload.password,
      experience_type: payload.experienceType,
      previous_company: payload.previousCompany,
      current_company: payload.currentCompany,
      reason_for_change: payload.reasonForChange,
      post: payload.post,
    }),
  });
  tokenStorage.set(data.access_token);
  return data.user;
}

export async function loginRecruiter(email: string, password: string): Promise<ActiveUser> {
  const data = await request<TokenResponse>('/auth/recruiter/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  tokenStorage.set(data.access_token);
  return data.user;
}

export async function signupRecruiter(payload: {
  name: string;
  email: string;
  password: string;
  company: string;
  title: string;
  industry?: string;
  teamSize?: string;
  website?: string;
  headquarters?: string;
  companyDescription?: string;
}): Promise<ActiveUser> {
  const data = await request<TokenResponse>('/auth/recruiter/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      company: payload.company,
      title: payload.title,
      industry: payload.industry,
      team_size: payload.teamSize,
      website: payload.website,
      headquarters: payload.headquarters,
      company_description: payload.companyDescription,
    }),
  });
  tokenStorage.set(data.access_token);
  return data.user;
}

export async function getMe(): Promise<ActiveUser> {
  return request<ActiveUser>('/auth/me');
}

export function logoutApi(): void {
  tokenStorage.clear();
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function listCandidates(params?: {
  q?: string;
  skill?: string;
  location?: string;
  experienceType?: string;
  college?: string;
  sortBy?: string;
}): Promise<CandidateUser[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.skill) search.set('skill', params.skill);
  if (params?.location) search.set('location', params.location);
  if (params?.experienceType) search.set('experienceType', params.experienceType);
  if (params?.college) search.set('college', params.college);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  const qs = search.toString();
  return request<CandidateUser[]>(`/candidates${qs ? `?${qs}` : ''}`);
}

export async function getCandidate(id: string): Promise<CandidateUser> {
  return request<CandidateUser>(`/candidates/${encodeURIComponent(id)}`);
}

export async function updateCandidate(
  id: string,
  patch: Partial<CandidateUser>
): Promise<CandidateUser> {
  return request<CandidateUser>(`/candidates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function addProfileView(
  candidateId: string,
  payload: { recruiterId: string; recruiterName: string; company: string }
): Promise<CandidateUser> {
  return request<CandidateUser>(`/candidates/${encodeURIComponent(candidateId)}/profile-view`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Recruiters ───────────────────────────────────────────────────────────────

export async function updateRecruiter(
  id: string,
  patch: Partial<RecruiterUser>
): Promise<RecruiterUser> {
  return request<RecruiterUser>(`/recruiters/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function listJobs(recruiterId?: string): Promise<JobPosting[]> {
  const qs = recruiterId ? `?recruiterId=${encodeURIComponent(recruiterId)}` : '';
  const jobs = await request<JobPosting[]>(`/jobs${qs}`);
  return jobs.map(normalizeJob);
}

export async function createJob(payload: {
  title: string;
  company?: string;
  type: 'job' | 'internship';
  skills: string[];
  location: string;
  salary?: string;
  description: string;
}): Promise<JobPosting> {
  const job = await request<JobPosting>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeJob(job);
}

function normalizeJob(job: JobPosting): JobPosting {
  return {
    ...job,
    postedAt: job.postedAt
      ? typeof job.postedAt === 'string'
        ? job.postedAt
        : String(job.postedAt)
      : undefined,
  };
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function listApplications(): Promise<Application[]> {
  const apps = await request<Application[]>('/applications');
  return apps.map(normalizeApplication);
}

export async function createApplication(payload: {
  candidateId: string;
  stage: PipelineStage;
  jobId?: string;
  matchScore?: number;
  notes?: string;
}): Promise<Application> {
  const app = await request<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeApplication(app);
}

export async function updateApplicationStage(
  appId: string,
  stage: PipelineStage,
  extras?: { notes?: string; outreachSent?: boolean }
): Promise<Application> {
  const app = await request<Application>(`/applications/${encodeURIComponent(appId)}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage, ...extras }),
  });
  return normalizeApplication(app);
}

export async function applyToJob(jobId: string): Promise<Application> {
  const app = await request<Application>(`/applications/apply/${encodeURIComponent(jobId)}`, {
    method: 'POST',
  });
  return normalizeApplication(app);
}

function normalizeApplication(app: Application): Application {
  return {
    ...app,
    createdAt: typeof app.createdAt === 'string' ? app.createdAt : String(app.createdAt),
    updatedAt: typeof app.updatedAt === 'string' ? app.updatedAt : String(app.updatedAt),
  };
}

// ─── Match ────────────────────────────────────────────────────────────────────

export async function computeMatch(
  candidateId: string,
  requiredSkills: string[]
): Promise<MatchResult> {
  return request<MatchResult>('/match/compute', {
    method: 'POST',
    body: JSON.stringify({ candidateId, requiredSkills }),
  });
}

export async function batchMatch(payload: {
  jobId?: string;
  requiredSkills?: string[];
  candidateIds?: string[];
  limit?: number;
}): Promise<MatchResult[]> {
  return request<MatchResult[]>('/match/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Copilot ──────────────────────────────────────────────────────────────────

export async function copilotQuery(query: string): Promise<{
  message: CopilotMessage;
  candidates: CandidateUser[];
}> {
  return request('/copilot/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export async function getCopilotHistory(): Promise<CopilotMessage[]> {
  return request<CopilotMessage[]>('/copilot/history');
}

export async function clearCopilotHistory(): Promise<void> {
  return request<void>('/copilot/history', { method: 'DELETE' });
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string }> {
  return request('/health');
}
