const router = require('express').Router();
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

function computeMatchScore(candidate, requiredSkills = []) {
  const candidateSkills = (candidate.skills || []).map(s => String(s).toLowerCase());
  const required = requiredSkills.map(s => String(s).toLowerCase());

  const matched = required.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
  const skillMatch = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 50;

  const expScore = candidate.experience_type === 'experienced' ? 80 : 60;
  const experienceMatch = Math.min(100, expScore + ((candidate.score || 0) > 70 ? 15 : 0));

  const hackathons = candidate.hackathons || [];
  const projectPPTs = candidate.project_ppts || [];
  const projectRelevance = Math.min(100, 40 +
    hackathons.length * 12 +
    projectPPTs.length * 8 +
    (candidate.github_url ? 15 : 0)
  );

  const culturalFit = Math.min(100, Math.round(
    (candidate.profile_completion || 20) * 0.7 +
    (candidate.verified_badge ? 20 : 0) +
    (candidate.about ? 10 : 0)
  ));

  const certificates = candidate.certificates || [];
  const hackathonBonus = Math.min(100, hackathons.length * 25 + certificates.length * 10);

  const overallScore = Math.round(
    skillMatch * 0.35 +
    experienceMatch * 0.20 +
    projectRelevance * 0.20 +
    culturalFit * 0.15 +
    hackathonBonus * 0.10
  );

  let verdict = 'Weak Fit';
  if (overallScore >= 80) verdict = 'Strong Fit';
  else if (overallScore >= 65) verdict = 'Good Fit';
  else if (overallScore >= 50) verdict = 'Moderate Fit';

  const strengths = [];
  if (skillMatch >= 70) strengths.push(`${matched.length}/${required.length} required skills matched`);
  if (hackathons.length > 0) strengths.push(`${hackathons.length} hackathon(s) participated`);
  if (candidate.github_url) strengths.push('Active GitHub profile verified');
  if (candidate.verified_badge) strengths.push('Fully verified profile badge');
  if (candidate.college) strengths.push(`Studied at ${candidate.college}`);

  const gaps = [];
  const missingSkills = required.filter(s => !candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
  if (missingSkills.length > 0) gaps.push(`Missing skills: ${missingSkills.slice(0, 3).join(', ')}`);
  if (!candidate.resume_name) gaps.push('No resume uploaded');
  if ((candidate.profile_completion || 0) < 70) gaps.push('Profile completion below 70%');

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
    verdict,
  };
}

// POST /match/compute
router.post('/compute', requireAuth, async (req, res, next) => {
  try {
    const { candidateId, requiredSkills = [] } = req.body;
    const candidate = await Candidate.findOne({ id: candidateId }).lean();
    if (!candidate) return res.status(404).json({ detail: 'Candidate not found.' });
    return res.json(computeMatchScore(candidate, requiredSkills));
  } catch (err) { next(err); }
});

// POST /match/batch
router.post('/batch', requireAuth, async (req, res, next) => {
  try {
    let { jobId, requiredSkills, candidateIds, limit = 20 } = req.body;

    if (jobId && (!requiredSkills || requiredSkills.length === 0)) {
      const job = await Job.findOne({ id: jobId }).lean();
      if (job) requiredSkills = job.skills || [];
    }

    requiredSkills = requiredSkills || [];

    const filter = {};
    if (candidateIds && candidateIds.length > 0) {
      filter.id = { $in: candidateIds };
    }

    const candidates = await Candidate.find(filter).lean();

    const results = candidates
      .map(c => computeMatchScore(c, requiredSkills))
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);

    return res.json(results);
  } catch (err) { next(err); }
});

module.exports = router;