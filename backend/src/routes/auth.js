const router = require('express').Router();
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');
const { hashPassword, verifyPassword, createAccessToken } = require('../utils/security');
const { generateCandidateId, generateRecruiterId } = require('../utils/idGenerator');
const { requireAuth } = require('../middleware/auth');

function calcProfileCompletion(c) {
  let score = 20;
  if (c.skills && c.skills.length > 0) score += 10;
  if (c.github_url) score += 10;
  if (c.leetcode_url) score += 10;
  if (c.linkedin_url) score += 5;
  if (c.resume_name) score += 10;
  if (c.project_ppts && c.project_ppts.length > 0) score += 5;
  if (c.certificates && c.certificates.length > 0) score += 5;
  if (c.hackathons && c.hackathons.length > 0) score += 5;
  if (c.about) score += 5;
  if (c.college) score += 3;
  if (c.university) score += 3;
  if (c.location) score += 4;
  if (c.agent_analysis_done) score += 5;
  return Math.min(score, 100);
}

function candidateToDict(c) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    mobile: c.mobile || '',
    role: 'candidate',
    experienceType: c.experience_type,
    previousCompany: c.previous_company,
    currentCompany: c.current_company,
    reasonForChange: c.reason_for_change,
    post: c.post,
    createdAt: c.created_at,
    profileCompletion: c.profile_completion,
    agentAnalysisDone: c.agent_analysis_done,
    verifiedBadge: c.verified_badge,
    rank: c.rank,
    globalRank: c.rank,
    score: c.score,
    codingTestScore: c.coding_test_score,
    resumeName: c.resume_name,
    projectPPTs: c.project_ppts || [],
    skills: c.skills || [],
    githubUrl: c.github_url,
    leetcodeUrl: c.leetcode_url,
    linkedinUrl: c.linkedin_url,
    certificates: c.certificates || [],
    hackathons: c.hackathons || [],
    about: c.about,
    college: c.college,
    university: c.university,
    location: c.location,
    avatar: c.avatar,
    skillLevels: c.skill_levels || [],
    recommendations: c.recommendations || [],
    profileViews: c.profile_views || [],
  };
}

function recruiterToDict(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: 'recruiter',
    company: r.company,
    title: r.title,
    createdAt: r.created_at,
    industry: r.industry,
    teamSize: r.team_size,
    website: r.website,
    logoUrl: r.logo_url,
    companyDescription: r.company_description,
    headquarters: r.headquarters,
  };
}

async function recalcRanks() {
  const candidates = await Candidate.find({}, 'id score').sort({ score: -1 }).lean();
  for (let i = 0; i < candidates.length; i++) {
    await Candidate.updateOne({ id: candidates[i].id }, { rank: i + 1 });
  }
}

function tokenResponse(userDict) {
  const token = createAccessToken({
    sub: userDict.id,
    role: userDict.role,
    email: userDict.email,
  });
  return { access_token: token, token_type: 'bearer', user: userDict };
}

// POST /auth/candidate/signup
router.post('/candidate/signup', async (req, res, next) => {
  try {
    const { name, email, mobile, password, experience_type, previous_company, current_company, reason_for_change, post } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ detail: 'name, email and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ detail: 'Password must be at least 4 characters' });
    }

    const existing = await Candidate.findOne({ email: email.toLowerCase() }).lean();
    if (existing) return res.status(400).json({ detail: 'An account with this email already exists.' });

    const newCandidate = {
      id: generateCandidateId(name),
      name: name.trim(),
      email: email.toLowerCase(),
      mobile: mobile || '',
      password_hash: hashPassword(password),
      experience_type: experience_type || 'fresher',
      previous_company: previous_company || null,
      current_company: current_company || null,
      reason_for_change: reason_for_change || null,
      post: post || null,
      skills: [],
      project_ppts: [],
      certificates: [],
      hackathons: [],
      skill_levels: [],
      recommendations: [],
      profile_views: [],
      profile_completion: 20,
      score: 0,
      agent_analysis_done: false,
      verified_badge: false,
    };

    newCandidate.profile_completion = calcProfileCompletion(newCandidate);

    await Candidate.create(newCandidate);
    await recalcRanks();

    const ranked = await Candidate.findOne({ id: newCandidate.id }).lean();
    return res.status(201).json(tokenResponse(candidateToDict(ranked)));
  } catch (err) { next(err); }
});

// POST /auth/candidate/login
router.post('/candidate/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'email and password required' });

    const candidate = await Candidate.findOne({ email: email.toLowerCase() }).lean();
    if (!candidate || !verifyPassword(password, candidate.password_hash)) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    return res.json(tokenResponse(candidateToDict(candidate)));
  } catch (err) { next(err); }
});

// POST /auth/recruiter/signup
router.post('/recruiter/signup', async (req, res, next) => {
  try {
    const { name, email, password, company, title, industry, team_size, website, headquarters, company_description } = req.body;

    if (!name || !email || !password || !company || !title) {
      return res.status(400).json({ detail: 'name, email, password, company and title are required' });
    }

    const existing = await Recruiter.findOne({ email: email.toLowerCase() }).lean();
    if (existing) return res.status(400).json({ detail: 'An account with this email already exists.' });

    const newRecruiter = {
      id: generateRecruiterId(),
      name: name.trim(),
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      company,
      title,
      industry: industry || null,
      team_size: team_size || null,
      website: website || null,
      headquarters: headquarters || null,
      company_description: company_description || null,
    };

    const inserted = await Recruiter.create(newRecruiter);
    return res.status(201).json(tokenResponse(recruiterToDict(inserted.toObject())));
  } catch (err) { next(err); }
});

// POST /auth/recruiter/login
router.post('/recruiter/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'email and password required' });

    const recruiter = await Recruiter.findOne({ email: email.toLowerCase() }).lean();
    if (!recruiter || !verifyPassword(password, recruiter.password_hash)) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    return res.json(tokenResponse(recruiterToDict(recruiter)));
  } catch (err) { next(err); }
});

// GET /auth/me
router.get('/me', requireAuth, (req, res) => {
  if (req.currentRole === 'candidate') {
    return res.json(candidateToDict(req.currentUser));
  }
  return res.json(recruiterToDict(req.currentUser));
});

module.exports = router;