// ─── Shared ──────────────────────────────────────────────────────────────────
export type UserRole = 'candidate' | 'recruiter' | null;
export type ExperienceType = 'fresher' | 'experienced';
export type PipelineStage = 'Discovered' | 'Shortlisted' | 'Contacted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';

// ─── Coding Question (used in CodeEditor and Dashboard) ───────────────────────
export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// ─── Candidate ────────────────────────────────────────────────────────────────
export interface Certificate {
  name: string;
  issuer: string;
  year?: string;
  fileName?: string;
}

export interface Hackathon {
  name: string;
  role: string;
  year?: string;
}

export interface SkillLevel {
  skill: string;
  level: number; // 0-100
}

export interface AIRecommendation {
  type: 'course' | 'job' | 'internship' | 'improvement';
  title: string;
  description: string;
  discount?: string;
  url?: string;
  provider?: string;
}

export interface CandidateUser {
  // ── Immutable signup fields ──
  id: string;          // unique e.g. ALEX#4729
  name: string;
  email: string;
  mobile: string;
  password: string;    // demo: stored as-is (no real backend)
  role: 'candidate';
  experienceType: ExperienceType;
  previousCompany?: string;
  currentCompany?: string;
  reasonForChange?: string;
  post?: string;       // job title / role applied for
  createdAt: string;

  // ── Profile completion ──
  profileCompletion: number;   // 0-100
  agentAnalysisDone: boolean;
  verifiedBadge: boolean;
  rank?: number;               // global rank among all candidates
  globalRank?: number;         // alias for rank (used in dashboard UI)
  score: number;               // starts at 0, increases with tests
  codingTestScore?: number;

  // ── Extended profile ──
  resumeName?: string;
  projectPPTs?: string[];      // file names
  skills: string[];
  githubUrl?: string;
  leetcodeUrl?: string;
  linkedinUrl?: string;
  certificates?: Certificate[];
  hackathons?: Hackathon[];
  about?: string;
  college?: string;
  university?: string;
  location?: string;
  avatar?: string;             // initials-based generated

  // ── Analysis results ──
  skillLevels?: SkillLevel[];
  recommendations?: AIRecommendation[];

  // ── Notifications from recruiters viewing ──
  profileViews?: ProfileView[];
}

export interface ProfileView {
  recruiterId: string;
  recruiterName: string;
  company: string;
  viewedAt: string;
}

// ─── Recruiter ────────────────────────────────────────────────────────────────
export interface RecruiterUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'recruiter';
  company: string;
  title: string;
  createdAt: string;
  // Extended company details
  industry?: string;
  teamSize?: string;
  website?: string;
  logoUrl?: string;
  companyDescription?: string;
  headquarters?: string;
}

// ─── AI Match Result ─────────────────────────────────────────────────────────
export interface MatchResult {
  candidateId: string;
  overallScore: number;        // 0-100
  skillMatch: number;          // 0-100
  experienceMatch: number;     // 0-100
  projectRelevance: number;    // 0-100
  culturalFit: number;         // 0-100
  hackathonBonus: number;      // 0-100
  summary: string;
  strengths: string[];
  gaps: string[];
  verdict: 'Strong Fit' | 'Good Fit' | 'Moderate Fit' | 'Weak Fit';
}

// ─── Hiring Pipeline / Application ───────────────────────────────────────────
export interface Application {
  id: string;
  candidateId: string;
  recruiterId: string;
  jobId?: string;
  stage: PipelineStage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
  scheduledInterview?: InterviewSlot;
  outreachSent?: boolean;
}

export interface InterviewSlot {
  date: string;
  time: string;
  mode: 'Online' | 'Offline';
  link?: string;
  venue?: string;
}

// ─── AI Copilot ──────────────────────────────────────────────────────────────
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  candidateResults?: CandidateUser[];
}

// ─── Active user (either role) ───────────────────────────────────────────────
export type ActiveUser = CandidateUser | RecruiterUser;

// ─── Job/Internship posting ───────────────────────────────────────────────────
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'Job' | 'Internship';
  skills: string[];
  location: string;
  salary?: string;
  postedBy: string; // recruiter id
  postedAt?: string;
  description: string;
}

// ─── Legacy landing page types (unchanged) ───────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter';
  avatar: string;
  title: string;
  companyOrTarget?: string;
  matchScore?: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  category: 'matching' | 'analytics' | 'agents' | 'security';
  description: string;
  iconName: string;
  metrics: string;
  tags: string[];
  pythonAgent: string;
  detailHighlight: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  matchScore: number;
  aiSummary: string;
  pythonVerification: string;
  status: 'Top Recommended' | 'High Potential' | 'Verified Specialist';
  avatar: string;
}

export interface PythonAgent {
  id: string;
  name: string;
  module: string;
  description: string;
  status: 'active' | 'processing' | 'idle';
  latency: string;
  techStack: string[];
  sampleOutput: string;
}

export interface PricingTier {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  popular?: boolean;
  features: string[];
  cta: string;
}
