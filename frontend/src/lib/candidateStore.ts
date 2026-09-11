import { CandidateUser, RecruiterUser, JobPosting, Application, MatchResult, CopilotMessage, PipelineStage } from '../types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const CANDIDATES_KEY = 'atm_candidates';
const RECRUITERS_KEY = 'atm_recruiters';
const CURRENT_USER_KEY = 'atm_current_user';
const JOBS_KEY = 'atm_jobs';
const APPLICATIONS_KEY = 'atm_applications';
const COPILOT_KEY = 'atm_copilot';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Unique ID generator ──────────────────────────────────────────────────────
export function generateUniqueId(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${num}`;
}

// ─── Profile Completion Calculator ───────────────────────────────────────────
export function calcProfileCompletion(c: CandidateUser): number {
  let score = 20; // base from signup

  if (c.skills && c.skills.length > 0) score += 10;
  if (c.githubUrl) score += 10;
  if (c.leetcodeUrl) score += 10;
  if (c.linkedinUrl) score += 5;
  if (c.resumeName) score += 10;
  if (c.projectPPTs && c.projectPPTs.length > 0) score += 5;
  if (c.certificates && c.certificates.length > 0) score += 5;
  if (c.hackathons && c.hackathons.length > 0) score += 5;
  if (c.about) score += 5;
  if (c.college) score += 3;
  if (c.university) score += 3;
  if (c.location) score += 4;
  if (c.agentAnalysisDone) score += 5;

  return Math.min(score, 100);
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
export function getAvatarColor(name: string): string {
  const colors = [
    '#D97706', '#B45309', '#92400E', '#047857',
    '#1D4ED8', '#7C3AED', '#DB2777', '#DC2626',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

// ─── AI Match Score Engine ────────────────────────────────────────────────────
export function computeMatchScore(candidate: CandidateUser, requiredSkills: string[]): MatchResult {
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const required = requiredSkills.map(s => s.toLowerCase());

  // Skill match
  const matched = required.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
  const skillMatch = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 50;

  // Experience match
  const expScore = candidate.experienceType === 'experienced' ? 80 : 60;
  const experienceMatch = Math.min(100, expScore + (candidate.score > 70 ? 15 : 0));

  // Project relevance (based on hackathons + PPTs)
  const projectRelevance = Math.min(100, 40 +
    (candidate.hackathons?.length || 0) * 12 +
    (candidate.projectPPTs?.length || 0) * 8 +
    (candidate.githubUrl ? 15 : 0));

  // Cultural fit (profile completion + verified)
  const culturalFit = Math.min(100, Math.round(candidate.profileCompletion * 0.7 +
    (candidate.verifiedBadge ? 20 : 0) +
    (candidate.about ? 10 : 0)));

  // Hackathon bonus
  const hackathonBonus = Math.min(100, (candidate.hackathons?.length || 0) * 25 +
    (candidate.certificates?.length || 0) * 10);

  // Overall weighted score
  const overallScore = Math.round(
    skillMatch * 0.35 +
    experienceMatch * 0.20 +
    projectRelevance * 0.20 +
    culturalFit * 0.15 +
    hackathonBonus * 0.10
  );

  // Verdict
  let verdict: MatchResult['verdict'] = 'Weak Fit';
  if (overallScore >= 80) verdict = 'Strong Fit';
  else if (overallScore >= 65) verdict = 'Good Fit';
  else if (overallScore >= 50) verdict = 'Moderate Fit';

  // Strengths
  const strengths: string[] = [];
  if (skillMatch >= 70) strengths.push(`${matched.length}/${required.length} required skills matched`);
  if (candidate.hackathons && candidate.hackathons.length > 0) strengths.push(`${candidate.hackathons.length} hackathon(s) participated`);
  if (candidate.githubUrl) strengths.push('Active GitHub profile verified');
  if (candidate.verifiedBadge) strengths.push('Fully verified profile badge');
  if (candidate.college) strengths.push(`Studied at ${candidate.college}`);

  // Gaps
  const gaps: string[] = [];
  const missingSkills = required.filter(s => !candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
  if (missingSkills.length > 0) gaps.push(`Missing skills: ${missingSkills.slice(0, 3).join(', ')}`);
  if (!candidate.resumeName) gaps.push('No resume uploaded');
  if (candidate.profileCompletion < 70) gaps.push('Profile completion below 70%');

  const summary = `${candidate.name} is a ${verdict.toLowerCase()} for this role with ${overallScore}% overall compatibility. ` +
    (strengths.length > 0 ? `Key strengths: ${strengths[0]}. ` : '') +
    (gaps.length > 0 ? `Areas of concern: ${gaps[0]}.` : 'All key requirements are met.');

  return {
    candidateId: candidate.id,
    overallScore,
    skillMatch,
    experienceMatch,
    projectRelevance,
    culturalFit,
    hackathonBonus,
    summary,
    strengths,
    gaps,
    verdict
  };
}

// ─── AI Copilot NLP Engine ────────────────────────────────────────────────────
export function processCopilotQuery(query: string, candidates: CandidateUser[]): CandidateUser[] {
  const q = query.toLowerCase();

  // Extract location intent
  const locationKeywords = ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'pune', 'chennai', 'kolkata', 'remote', 'india'];
  const mentionedLocation = locationKeywords.find(loc => q.includes(loc));

  // Extract skill intents
  const skillMap: Record<string, string[]> = {
    'react': ['react', 'reactjs', 'react.js'],
    'ai': ['ai', 'ml', 'machine learning', 'deep learning', 'llm', 'genai', 'artificial intelligence'],
    'python': ['python', 'django', 'fastapi', 'flask'],
    'node': ['node', 'nodejs', 'express', 'backend'],
    'fullstack': ['fullstack', 'full stack', 'mern', 'mean'],
    'android': ['android', 'kotlin', 'java mobile'],
    'data': ['data science', 'data analyst', 'pandas', 'numpy'],
    'devops': ['devops', 'docker', 'kubernetes', 'aws', 'cloud'],
    'open source': ['open source', 'github', 'oss'],
    'hackathon': ['hackathon', 'hackathons'],
  };

  let matched = [...candidates];

  // Location filter
  if (mentionedLocation) {
    matched = matched.filter(c =>
      c.location?.toLowerCase().includes(mentionedLocation)
    );
    // fallback if no location match
    if (matched.length === 0) matched = [...candidates];
  }

  // Skill filter
  for (const [intent, keywords] of Object.entries(skillMap)) {
    if (keywords.some(k => q.includes(k))) {
      const skillFiltered = matched.filter(c =>
        c.skills.some(s => keywords.some(k => s.toLowerCase().includes(k)))
      );
      if (skillFiltered.length > 0) matched = skillFiltered;
    }
  }

  // Hackathon filter
  if (q.includes('hackathon')) {
    matched = matched.filter(c => c.hackathons && c.hackathons.length > 0);
  }

  // Fresher/experienced filter
  if (q.includes('fresher') || q.includes('student') || q.includes('intern')) {
    matched = matched.filter(c => c.experienceType === 'fresher');
  } else if (q.includes('experienced') || q.includes('senior')) {
    matched = matched.filter(c => c.experienceType === 'experienced');
  }

  // Sort by score desc
  return matched.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6);
}

// ─── Demo seed candidates ─────────────────────────────────────────────────────
const SEED_CANDIDATES: CandidateUser[] = [
  {
    id: 'ALEX#4729',
    name: 'Alex Mercer',
    email: 'alex@matrix.ai',
    mobile: '9876543210',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'Tech Corp',
    post: 'Frontend Engineer',
    createdAt: new Date().toISOString(),
    profileCompletion: 100,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 1,
    globalRank: 1,
    score: 92,
    skills: ['React', 'TypeScript', 'Next.js', 'Python', 'TailwindCSS'],
    githubUrl: 'https://github.com/alexmercer',
    leetcodeUrl: 'https://leetcode.com/alexmercer',
    linkedinUrl: 'https://linkedin.com/in/alexmercer',
    resumeName: 'alex_mercer_resume.pdf',
    about: 'Passionate frontend software engineer specializing in scalable React & Next.js web applications and AI tools.',
    college: 'IIT Bombay',
    university: 'Mumbai University',
    location: 'Mumbai, India',
    hackathons: [
      { name: 'HackIndia 2024', role: 'Team Lead', year: '2024' },
      { name: 'Smart India Hackathon', role: 'Developer', year: '2023' },
    ],
    certificates: [
      { name: 'AWS Certified Developer', issuer: 'Amazon', year: '2024' },
      { name: 'Meta React Certification', issuer: 'Meta', year: '2023' },
    ],
    projectPPTs: ['ecommerce_ai.pptx', 'chat_app.pptx'],
    skillLevels: [
      { skill: 'React', level: 92 },
      { skill: 'TypeScript', level: 88 },
      { skill: 'Next.js', level: 85 },
      { skill: 'Python', level: 78 },
      { skill: 'TailwindCSS', level: 95 },
    ],
    recommendations: [
      { type: 'improvement', title: 'Advanced System Design', description: 'Focus on distributed systems and microservices patterns' },
      { type: 'course', title: 'Open Source AI Models', description: 'Contribute to popular open-source AI frameworks', discount: '20% OFF' }
    ]
  },
  {
    id: 'PRIY#2210',
    name: 'Priya Sharma',
    email: 'priya@matrix.ai',
    mobile: '9865432100',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'DataMinds AI',
    post: 'ML Engineer',
    createdAt: new Date().toISOString(),
    profileCompletion: 95,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 2,
    globalRank: 2,
    score: 88,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'GenAI', 'Scikit-learn'],
    githubUrl: 'https://github.com/priyasharma',
    linkedinUrl: 'https://linkedin.com/in/priyasharma',
    resumeName: 'priya_resume.pdf',
    about: 'ML Engineer with 3+ years building production AI systems. Expert in LLMs, RAG pipelines, and fine-tuning foundation models.',
    college: 'IIT Delhi',
    university: 'Delhi University',
    location: 'Delhi, India',
    hackathons: [
      { name: 'Google AI Hackathon', role: 'Winner', year: '2024' },
    ],
    certificates: [
      { name: 'TensorFlow Developer Certificate', issuer: 'Google', year: '2023' },
      { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: '2022' },
    ],
    projectPPTs: ['rag_pipeline.pptx'],
    skillLevels: [
      { skill: 'Python', level: 95 },
      { skill: 'PyTorch', level: 90 },
      { skill: 'LLMs', level: 88 },
      { skill: 'GenAI', level: 85 },
      { skill: 'Scikit-learn', level: 80 },
    ],
  },
  {
    id: 'ROHA#3312',
    name: 'Rohan Verma',
    email: 'rohan@matrix.ai',
    mobile: '9754321000',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'FullStack Labs',
    post: 'Full Stack Developer',
    createdAt: new Date().toISOString(),
    profileCompletion: 90,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 3,
    globalRank: 3,
    score: 84,
    skills: ['Node.js', 'React', 'MongoDB', 'Docker', 'AWS', 'GraphQL'],
    githubUrl: 'https://github.com/rohanverma',
    linkedinUrl: 'https://linkedin.com/in/rohanverma',
    resumeName: 'rohan_resume.pdf',
    about: 'Full-stack developer passionate about building scalable distributed systems and cloud-native applications.',
    college: 'BITS Pilani',
    university: 'BITS University',
    location: 'Bangalore, India',
    hackathons: [
      { name: 'AWS Build On India', role: 'Finalist', year: '2024' },
      { name: 'HackBangalore', role: 'Team Lead', year: '2023' },
    ],
    certificates: [
      { name: 'AWS Solutions Architect', issuer: 'Amazon', year: '2024' },
    ],
    skillLevels: [
      { skill: 'Node.js', level: 88 },
      { skill: 'React', level: 82 },
      { skill: 'MongoDB', level: 78 },
      { skill: 'Docker', level: 75 },
      { skill: 'AWS', level: 85 },
    ],
  },
  {
    id: 'ANKI#5501',
    name: 'Ankita Joshi',
    email: 'ankita@matrix.ai',
    mobile: '9643210987',
    password: 'password123',
    role: 'candidate',
    experienceType: 'fresher',
    post: 'Data Science Intern',
    createdAt: new Date().toISOString(),
    profileCompletion: 85,
    agentAnalysisDone: true,
    verifiedBadge: false,
    rank: 4,
    globalRank: 4,
    score: 79,
    skills: ['Python', 'Pandas', 'Numpy', 'SQL', 'Power BI', 'Machine Learning'],
    githubUrl: 'https://github.com/ankitajoshi',
    resumeName: 'ankita_resume.pdf',
    about: 'Final year B.Tech student with strong data analytics skills. Love turning raw data into actionable insights.',
    college: 'NIT Trichy',
    university: 'Anna University',
    location: 'Chennai, India',
    hackathons: [
      { name: 'DataHack 2024', role: 'Participant', year: '2024' },
    ],
    certificates: [
      { name: 'Google Data Analytics', issuer: 'Google', year: '2024' },
    ],
    skillLevels: [
      { skill: 'Python', level: 82 },
      { skill: 'Pandas', level: 85 },
      { skill: 'SQL', level: 78 },
      { skill: 'Power BI', level: 70 },
      { skill: 'ML', level: 65 },
    ],
  },
  {
    id: 'SARA#7723',
    name: 'Sarath Kumar',
    email: 'sarath@matrix.ai',
    mobile: '9532100876',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'CloudNative Inc',
    post: 'DevOps Engineer',
    createdAt: new Date().toISOString(),
    profileCompletion: 88,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 5,
    globalRank: 5,
    score: 76,
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'],
    githubUrl: 'https://github.com/sarathkumar',
    linkedinUrl: 'https://linkedin.com/in/sarathkumar',
    resumeName: 'sarath_resume.pdf',
    about: 'DevOps engineer with 4 years experience orchestrating large-scale Kubernetes clusters and building CI/CD pipelines.',
    college: 'VIT Vellore',
    university: 'VIT University',
    location: 'Hyderabad, India',
    certificates: [
      { name: 'CKA — Certified Kubernetes Administrator', issuer: 'CNCF', year: '2023' },
      { name: 'AWS DevOps Professional', issuer: 'Amazon', year: '2024' },
    ],
    skillLevels: [
      { skill: 'Docker', level: 90 },
      { skill: 'Kubernetes', level: 88 },
      { skill: 'AWS', level: 82 },
      { skill: 'Terraform', level: 78 },
      { skill: 'Linux', level: 85 },
    ],
  },
  {
    id: 'NEHA#6612',
    name: 'Neha Patel',
    email: 'neha@matrix.ai',
    mobile: '9421098765',
    password: 'password123',
    role: 'candidate',
    experienceType: 'fresher',
    post: 'Android Developer Intern',
    createdAt: new Date().toISOString(),
    profileCompletion: 75,
    agentAnalysisDone: false,
    verifiedBadge: false,
    rank: 6,
    globalRank: 6,
    score: 68,
    skills: ['Kotlin', 'Android', 'Java', 'Firebase', 'Jetpack Compose'],
    githubUrl: 'https://github.com/nehapatel',
    resumeName: 'neha_resume.pdf',
    about: 'Passionate Android developer with 2 published apps on Play Store. Love building beautiful mobile experiences.',
    college: 'NSIT Delhi',
    university: 'IP University',
    location: 'Delhi, India',
    hackathons: [
      { name: 'Smart Delhi Hackathon', role: 'Developer', year: '2024' },
    ],
    skillLevels: [
      { skill: 'Kotlin', level: 80 },
      { skill: 'Android', level: 78 },
      { skill: 'Firebase', level: 72 },
      { skill: 'Jetpack Compose', level: 70 },
    ],
  },
  {
    id: 'ARYI#8834',
    name: 'Aryan Gupta',
    email: 'aryan@matrix.ai',
    mobile: '9312098654',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'OpenSource Hub',
    post: 'Backend Engineer',
    createdAt: new Date().toISOString(),
    profileCompletion: 92,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 7,
    globalRank: 7,
    score: 81,
    skills: ['Go', 'Python', 'PostgreSQL', 'Redis', 'gRPC', 'Open Source'],
    githubUrl: 'https://github.com/aryangupta',
    linkedinUrl: 'https://linkedin.com/in/aryangupta',
    resumeName: 'aryan_resume.pdf',
    about: 'Backend engineer and open-source contributor. Maintainer of 3 popular GitHub projects with 2k+ stars.',
    college: 'IIIT Hyderabad',
    university: 'JNTU Hyderabad',
    location: 'Pune, India',
    hackathons: [
      { name: 'GitHub Hackathon 2024', role: 'Winner', year: '2024' },
      { name: 'Open Source Summit', role: 'Speaker', year: '2023' },
    ],
    certificates: [
      { name: 'Google Cloud Professional', issuer: 'Google', year: '2024' },
    ],
    projectPPTs: ['grpc_service.pptx', 'open_source_contrib.pptx'],
    skillLevels: [
      { skill: 'Go', level: 88 },
      { skill: 'PostgreSQL', level: 85 },
      { skill: 'Redis', level: 80 },
      { skill: 'gRPC', level: 82 },
      { skill: 'Python', level: 75 },
    ],
  },
  {
    id: 'SIMI#9945',
    name: 'Simran Kaur',
    email: 'simran@matrix.ai',
    mobile: '9209876543',
    password: 'password123',
    role: 'candidate',
    experienceType: 'fresher',
    post: 'UI/UX Designer & Developer',
    createdAt: new Date().toISOString(),
    profileCompletion: 80,
    agentAnalysisDone: false,
    verifiedBadge: false,
    rank: 8,
    globalRank: 8,
    score: 72,
    skills: ['React', 'Figma', 'CSS', 'JavaScript', 'Framer Motion', 'Design Systems'],
    githubUrl: 'https://github.com/simrankaur',
    resumeName: 'simran_resume.pdf',
    about: 'Design-focused frontend developer bridging the gap between Figma and code. Strong eye for detail and micro-interactions.',
    college: 'Chandigarh University',
    university: 'Punjab Technical University',
    location: 'Chandigarh, India',
    skillLevels: [
      { skill: 'React', level: 75 },
      { skill: 'Figma', level: 88 },
      { skill: 'CSS', level: 85 },
      { skill: 'JavaScript', level: 72 },
      { skill: 'Framer Motion', level: 70 },
    ],
  },
  {
    id: 'VIKE#1178',
    name: 'Vikesh Nair',
    email: 'vikesh@matrix.ai',
    mobile: '9108765432',
    password: 'password123',
    role: 'candidate',
    experienceType: 'experienced',
    currentCompany: 'FinTech Solutions',
    post: 'Blockchain Developer',
    createdAt: new Date().toISOString(),
    profileCompletion: 86,
    agentAnalysisDone: true,
    verifiedBadge: true,
    rank: 9,
    globalRank: 9,
    score: 74,
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'React', 'Node.js', 'DeFi'],
    githubUrl: 'https://github.com/vikeshnair',
    linkedinUrl: 'https://linkedin.com/in/vikeshnair',
    resumeName: 'vikesh_resume.pdf',
    about: '3+ years building DeFi protocols and smart contracts on Ethereum. Deployed 5+ production dApps.',
    college: 'Amrita University',
    university: 'Amrita Vishwa Vidyapeetham',
    location: 'Bangalore, India',
    hackathons: [
      { name: 'ETHIndia Hackathon', role: 'Winner', year: '2024' },
    ],
    skillLevels: [
      { skill: 'Solidity', level: 88 },
      { skill: 'Web3.js', level: 85 },
      { skill: 'Ethereum', level: 82 },
      { skill: 'React', level: 75 },
      { skill: 'Node.js', level: 72 },
    ],
  },
  {
    id: 'DEMO#1001',
    name: 'Demo Candidate',
    email: 'candidate@demo.com',
    mobile: '9998887770',
    password: '123456',
    role: 'candidate',
    experienceType: 'fresher',
    createdAt: new Date().toISOString(),
    profileCompletion: 20,
    agentAnalysisDone: false,
    verifiedBadge: false,
    rank: 10,
    globalRank: 10,
    score: 0,
    skills: ['JavaScript', 'Python']
  }
];

// ─── Candidate CRUD ───────────────────────────────────────────────────────────
export const candidateStore = {
  getAll(): CandidateUser[] {
    const saved = read<CandidateUser>(CANDIDATES_KEY);
    if (saved.length > 0) return saved;
    write<CandidateUser>(CANDIDATES_KEY, SEED_CANDIDATES);
    return SEED_CANDIDATES;
  },

  getById(id: string): CandidateUser | null {
    return this.getAll().find((c) => c.id === id) ?? null;
  },

  getByEmail(email: string): CandidateUser | null {
    return this.getAll().find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  save(candidate: CandidateUser): void {
    const all = this.getAll().filter((c) => c.id !== candidate.id);
    candidate.profileCompletion = calcProfileCompletion(candidate);
    candidate.verifiedBadge = candidate.profileCompletion === 100 && candidate.agentAnalysisDone;
    write<CandidateUser>(CANDIDATES_KEY, [...all, candidate]);
  },

  update(id: string, patch: Partial<CandidateUser>): CandidateUser | null {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...patch };
    updated.profileCompletion = calcProfileCompletion(updated);
    updated.verifiedBadge = updated.profileCompletion === 100 && updated.agentAnalysisDone;
    all[idx] = updated;
    write<CandidateUser>(CANDIDATES_KEY, all);
    return updated;
  },

  recalcRanks(): void {
    const all = this.getAll().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    all.forEach((c, i) => { c.rank = i + 1; });
    write<CandidateUser>(CANDIDATES_KEY, all);
  },

  search(query: string): CandidateUser[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(q)) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.college || '').toLowerCase().includes(q) ||
        (c.university || '').toLowerCase().includes(q)
    );
  },

  addProfileView(candidateId: string, recruiterId: string, recruiterName: string, company: string): void {
    const cand = this.getById(candidateId);
    if (!cand) return;
    const views = cand.profileViews || [];
    // Avoid duplicate views from same recruiter in same day
    const today = new Date().toDateString();
    const alreadyViewed = views.some(v =>
      v.recruiterId === recruiterId && new Date(v.viewedAt).toDateString() === today
    );
    if (!alreadyViewed) {
      views.push({ recruiterId, recruiterName, company, viewedAt: new Date().toISOString() });
      this.update(candidateId, { profileViews: views });
    }
  },
};

// ─── Recruiter CRUD ───────────────────────────────────────────────────────────
export const recruiterStore = {
  getAll(): RecruiterUser[] {
    const saved = read<RecruiterUser>(RECRUITERS_KEY);
    if (saved.length > 0) return saved;

    const demoRecruiter: RecruiterUser[] = [
      {
        id: 'REC#9901',
        name: 'Sarah Connor',
        email: 'recruiter@matrix.ai',
        password: 'password123',
        role: 'recruiter',
        company: 'Nexus AI Technologies',
        title: 'Lead Talent Acquisition',
        createdAt: new Date().toISOString(),
        industry: 'Artificial Intelligence',
        teamSize: '201-500',
        website: 'https://nexusai.com',
        headquarters: 'Bangalore, India',
        companyDescription: 'Nexus AI builds next-generation AI infrastructure for enterprise clients worldwide.',
      },
      {
        id: 'REC#9902',
        name: 'Enterprise Recruiter',
        email: 'recruiter@company.com',
        password: '123456',
        role: 'recruiter',
        company: 'Global Tech Inc',
        title: 'Senior Hiring Manager',
        createdAt: new Date().toISOString(),
        industry: 'Software Services',
        teamSize: '1000+',
        headquarters: 'Mumbai, India',
      }
    ];

    write<RecruiterUser>(RECRUITERS_KEY, demoRecruiter);
    return demoRecruiter;
  },

  getByEmail(email: string): RecruiterUser | null {
    return this.getAll().find((r) => r.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  getById(id: string): RecruiterUser | null {
    return this.getAll().find((r) => r.id === id) ?? null;
  },

  save(recruiter: RecruiterUser): void {
    const all = this.getAll().filter((r) => r.id !== recruiter.id);
    write<RecruiterUser>(RECRUITERS_KEY, [...all, recruiter]);
  },

  update(id: string, patch: Partial<RecruiterUser>): RecruiterUser | null {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    write<RecruiterUser>(RECRUITERS_KEY, all);
    return all[idx];
  },
};

// ─── Current Session ─────────────────────────────────────────────────────────
export const sessionStore = {
  get(): CandidateUser | RecruiterUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(user: CandidateUser | RecruiterUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};

// ─── Application / Pipeline Store ────────────────────────────────────────────
export const applicationStore = {
  getAll(): Application[] {
    return read<Application>(APPLICATIONS_KEY);
  },

  getByRecruiter(recruiterId: string): Application[] {
    return this.getAll().filter(a => a.recruiterId === recruiterId);
  },

  getByCandidate(candidateId: string): Application[] {
    return this.getAll().filter(a => a.candidateId === candidateId);
  },

  upsert(app: Application): void {
    const all = this.getAll().filter(a => a.id !== app.id);
    app.updatedAt = new Date().toISOString();
    write<Application>(APPLICATIONS_KEY, [...all, app]);
  },

  updateStage(appId: string, stage: PipelineStage): void {
    const all = this.getAll();
    const idx = all.findIndex(a => a.id === appId);
    if (idx !== -1) {
      all[idx].stage = stage;
      all[idx].updatedAt = new Date().toISOString();
      write<Application>(APPLICATIONS_KEY, all);
    }
  },

  addOrMove(recruiterId: string, candidateId: string, stage: PipelineStage, jobId?: string, matchScore?: number): Application {
    const existing = this.getAll().find(a => a.recruiterId === recruiterId && a.candidateId === candidateId);
    if (existing) {
      existing.stage = stage;
      existing.updatedAt = new Date().toISOString();
      this.upsert(existing);
      return existing;
    }
    const newApp: Application = {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      candidateId,
      recruiterId,
      jobId,
      stage,
      matchScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.upsert(newApp);
    return newApp;
  },

  remove(appId: string): void {
    const all = this.getAll().filter(a => a.id !== appId);
    write<Application>(APPLICATIONS_KEY, all);
  },
};

// ─── AI Copilot History Store ─────────────────────────────────────────────────
export const copilotStore = {
  getMessages(recruiterId: string): CopilotMessage[] {
    const key = `${COPILOT_KEY}_${recruiterId}`;
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(key) || '[]') as CopilotMessage[];
    } catch { return []; }
  },

  addMessage(recruiterId: string, msg: CopilotMessage): void {
    const key = `${COPILOT_KEY}_${recruiterId}`;
    const all = this.getMessages(recruiterId);
    all.push(msg);
    // Keep last 50 messages
    const trimmed = all.slice(-50);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(trimmed));
    }
  },

  clear(recruiterId: string): void {
    const key = `${COPILOT_KEY}_${recruiterId}`;
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  },
};

// ─── Jobs CRUD ────────────────────────────────────────────────────────────────
export const jobStore = {
  getAll(): JobPosting[] {
    const saved = read<JobPosting>(JOBS_KEY);
    if (saved.length > 0) return saved;
    // Seed demo jobs
    const demo: JobPosting[] = [
      {
        id: 'job-1', title: 'Frontend Engineer (React/Next.js)', company: 'Nexus AI',
        type: 'job', skills: ['React', 'TypeScript', 'Next.js'], location: 'Remote',
        salary: '₹12–18 LPA', postedBy: 'REC#9901', postedAt: new Date().toISOString(),
        description: 'Build cutting-edge AI-powered interfaces for our enterprise platform.'
      },
      {
        id: 'job-2', title: 'ML Engineer Intern', company: 'Nexus AI',
        type: 'internship', skills: ['Python', 'PyTorch', 'ML', 'LLMs'], location: 'Bangalore',
        salary: '₹30k/mo', postedBy: 'REC#9901', postedAt: new Date().toISOString(),
        description: 'Work on real-world ML models for financial risk detection.'
      },
      {
        id: 'job-3', title: 'Full Stack Developer', company: 'Global Tech Inc',
        type: 'job', skills: ['Node.js', 'React', 'MongoDB'], location: 'Mumbai',
        salary: '₹8–14 LPA', postedBy: 'REC#9902', postedAt: new Date().toISOString(),
        description: 'Join our fast-growing startup and build products used by millions.'
      },
      {
        id: 'job-4', title: 'DevOps Engineer', company: 'Nexus AI',
        type: 'job', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], location: 'Hyderabad',
        salary: '₹14–22 LPA', postedBy: 'REC#9901', postedAt: new Date().toISOString(),
        description: 'Lead infrastructure and cloud operations for our AI platform.'
      },
      {
        id: 'job-5', title: 'AI Research Engineer', company: 'Nexus AI',
        type: 'job', skills: ['Python', 'PyTorch', 'Research', 'LLMs', 'GenAI'], location: 'Bangalore',
        salary: '₹25–40 LPA', postedBy: 'REC#9901', postedAt: new Date().toISOString(),
        description: 'Conduct fundamental AI research and apply it to real products.'
      },
    ];
    write<JobPosting>(JOBS_KEY, demo);
    return demo;
  },

  addJob(job: JobPosting): void {
    const all = this.getAll();
    write<JobPosting>(JOBS_KEY, [...all, job]);
  },

  getByRecruiter(recruiterId: string): JobPosting[] {
    return this.getAll().filter(j => j.postedBy === recruiterId);
  },

  getFiltered(skills: string[]): JobPosting[] {
    if (!skills || skills.length === 0) return this.getAll();
    return this.getAll().filter((j) =>
      j.skills.some((s) => skills.map((k) => k.toLowerCase()).includes(s.toLowerCase()))
    );
  },
};

// ─── Standalone helper (for pages that can't use AuthContext hook) ─────────────
export function updateCandidateProfile(id: string, patch: Partial<CandidateUser>): CandidateUser | null {
  return candidateStore.update(id, patch);
}
