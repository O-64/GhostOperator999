const router = require('express').Router();
const Candidate = require('../models/Candidate');
const CopilotMessage = require('../models/CopilotMessage');
const { requireAuth, requireRecruiter } = require('../middleware/auth');
const { generateShortId } = require('../utils/idGenerator');

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

function processCopilotQuery(query, candidates = []) {
  const q = query.toLowerCase();

  const locationKeywords = ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'pune', 'chennai', 'kolkata', 'remote', 'india'];
  const mentionedLocation = locationKeywords.find(loc => q.includes(loc));

  const skillMap = {
    react: ['react', 'reactjs', 'react.js'],
    ai: ['ai', 'ml', 'machine learning', 'deep learning', 'llm', 'genai', 'artificial intelligence'],
    python: ['python', 'django', 'fastapi', 'flask'],
    node: ['node', 'nodejs', 'express', 'backend'],
    fullstack: ['fullstack', 'full stack', 'mern', 'mean'],
    android: ['android', 'kotlin', 'java mobile'],
    data: ['data science', 'data analyst', 'pandas', 'numpy'],
    devops: ['devops', 'docker', 'kubernetes', 'aws', 'cloud'],
    'open source': ['open source', 'github', 'oss'],
    hackathon: ['hackathon', 'hackathons'],
  };

  let matched = [...candidates];

  if (mentionedLocation) {
    const locFiltered = matched.filter(c => (c.location || '').toLowerCase().includes(mentionedLocation));
    if (locFiltered.length > 0) matched = locFiltered;
  }

  for (const [intent, keywords] of Object.entries(skillMap)) {
    if (keywords.some(k => q.includes(k))) {
      const skillFiltered = matched.filter(c =>
        (c.skills || []).some(s => keywords.some(k => s.toLowerCase().includes(k)))
      );
      if (skillFiltered.length > 0) matched = skillFiltered;
    }
  }

  if (q.includes('hackathon')) {
    matched = matched.filter(c => (c.hackathons || []).length > 0);
  }

  if (q.includes('fresher') || q.includes('student') || q.includes('intern')) {
    matched = matched.filter(c => c.experience_type === 'fresher');
  } else if (q.includes('experienced') || q.includes('senior')) {
    matched = matched.filter(c => c.experience_type === 'experienced');
  }

  return matched.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6);
}

// POST /copilot/query
router.post('/query', requireAuth, requireRecruiter, async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ detail: 'query is required' });

    const recruiterId = req.currentUser.id;

    const allCandidates = await Candidate.find({}).lean();
    const matched = processCopilotQuery(query, allCandidates);

    const userMsg = {
      id: generateShortId('msg'),
      recruiter_id: recruiterId,
      role: 'user',
      content: query,
      candidate_results: null,
    };

    const assistantContent = matched.length > 0
      ? `I found ${matched.length} candidate${matched.length > 1 ? 's' : ''} matching your search for "${query}". Here are the top profiles:`
      : `No candidates directly matched "${query}". Try searching by technical skill (e.g. React, Python, ML) or location.`;

    const assistantMsg = {
      id: generateShortId('msg'),
      recruiter_id: recruiterId,
      role: 'assistant',
      content: assistantContent,
      candidate_results: matched.map(candidateToDict),
    };

    await CopilotMessage.insertMany([userMsg, assistantMsg]);

    return res.json({
      message: {
        id: assistantMsg.id,
        role: assistantMsg.role,
        content: assistantMsg.content,
        timestamp: new Date().toISOString(),
      },
      candidates: matched.map(candidateToDict),
    });
  } catch (err) { next(err); }
});

// GET /copilot/history
router.get('/history', requireAuth, requireRecruiter, async (req, res, next) => {
  try {
    const recruiterId = req.currentUser.id;
    const messages = await CopilotMessage.find({ recruiter_id: recruiterId }).sort({ created_at: 1 }).lean();

    const formatted = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.created_at,
    }));

    return res.json(formatted);
  } catch (err) { next(err); }
});

// DELETE /copilot/history
router.delete('/history', requireAuth, requireRecruiter, async (req, res, next) => {
  try {
    const recruiterId = req.currentUser.id;
    await CopilotMessage.deleteMany({ recruiter_id: recruiterId });
    return res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;