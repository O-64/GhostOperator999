const router = require('express').Router();
const Candidate = require('../models/Candidate');
const { requireAuth, requireRecruiter } = require('../middleware/auth');

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

// GET /candidates
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { q, skill, location, experienceType, college, sortBy = 'rank' } = req.query;
    const filter = {};
    if (experienceType && experienceType.toLowerCase() !== 'all') {
      filter.experience_type = experienceType.toLowerCase();
    }
    let candidates = await Candidate.find(filter).lean();

    if (q) {
      const ql = q.toLowerCase();
      candidates = candidates.filter(c =>
        (c.name || '').toLowerCase().includes(ql) ||
        (c.id || '').toLowerCase().includes(ql) ||
        (c.location || '').toLowerCase().includes(ql) ||
        (c.college || '').toLowerCase().includes(ql) ||
        (c.university || '').toLowerCase().includes(ql)
      );
    }
    if (skill) {
      const sl = skill.toLowerCase();
      candidates = candidates.filter(c => (c.skills || []).some(s => s.toLowerCase().includes(sl)));
    }
    if (location && location.toLowerCase() !== 'all') {
      const loc = location.toLowerCase();
      candidates = candidates.filter(c => (c.location || '').toLowerCase().includes(loc));
    }
    if (college) {
      const col = college.toLowerCase();
      candidates = candidates.filter(c =>
        (c.college || '').toLowerCase().includes(col) ||
        (c.university || '').toLowerCase().includes(col)
      );
    }
    if (sortBy === 'score') {
      candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'newest') {
      candidates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      candidates.sort((a, b) => (a.rank || 9999) - (b.rank || 9999));
    }
    return res.json(candidates.map(candidateToDict));
  } catch (err) { next(err); }
});

// GET /candidates/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id }).lean();
    if (!candidate) return res.status(404).json({ detail: 'Candidate not found.' });
    return res.json(candidateToDict(candidate));
  } catch (err) { next(err); }
});

// PATCH /candidates/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.currentRole === 'candidate' && req.currentUser.id !== id) {
      return res.status(403).json({ detail: 'You can only update your own profile.' });
    }
    const existing = await Candidate.findOne({ id }).lean();
    if (!existing) return res.status(404).json({ detail: 'Candidate not found.' });

    const fieldMap = {
      name: 'name', mobile: 'mobile',
      experienceType: 'experience_type',
      previousCompany: 'previous_company',
      currentCompany: 'current_company',
      reasonForChange: 'reason_for_change',
      post: 'post', resumeName: 'resume_name',
      projectPPTs: 'project_ppts', skills: 'skills',
      githubUrl: 'github_url', leetcodeUrl: 'leetcode_url', linkedinUrl: 'linkedin_url',
      certificates: 'certificates', hackathons: 'hackathons',
      about: 'about', college: 'college', university: 'university',
      location: 'location', avatar: 'avatar',
      agentAnalysisDone: 'agent_analysis_done',
      score: 'score', codingTestScore: 'coding_test_score',
      skillLevels: 'skill_levels', recommendations: 'recommendations',
    };

    const updates = {};
    for (const [apiKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[apiKey] !== undefined) updates[dbKey] = req.body[apiKey];
    }

    const merged = { ...existing, ...updates };
    updates.profile_completion = calcProfileCompletion(merged);
    updates.verified_badge = updates.profile_completion === 100 && merged.agent_analysis_done;

    await Candidate.updateOne({ id }, { $set: updates });

    if (req.body.score !== undefined) {
      const all = await Candidate.find({}, 'id score').sort({ score: -1 }).lean();
      for (let i = 0; i < all.length; i++) {
        await Candidate.updateOne({ id: all[i].id }, { $set: { rank: i + 1 } });
      }
    }

    const final = await Candidate.findOne({ id }).lean();
    return res.json(candidateToDict(final));
  } catch (err) { next(err); }
});

// POST /candidates/:id/profile-view
router.post('/:id/profile-view', requireAuth, requireRecruiter, async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id }).lean();
    if (!candidate) return res.status(404).json({ detail: 'Candidate not found.' });

    const { recruiterId, recruiterName, company } = req.body;
    const views = candidate.profile_views || [];
    const today = new Date().toISOString().split('T')[0];
    const alreadyViewed = views.some(v => v.recruiterId === recruiterId && (v.viewedAt || '').startsWith(today));

    if (!alreadyViewed) {
      views.push({ recruiterId, recruiterName, company, viewedAt: new Date().toISOString() });
      await Candidate.updateOne({ id: req.params.id }, { $set: { profile_views: views } });
    }

    const final = await Candidate.findOne({ id: req.params.id }).lean();
    return res.json(candidateToDict(final));
  } catch (err) { next(err); }
});

module.exports = router;