const router = require('express').Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { requireAuth, requireRecruiter, requireCandidate } = require('../middleware/auth');
const { generateShortId } = require('../utils/idGenerator');

function applicationToDict(a) {
  return {
    id: a.id,
    candidateId: a.candidate_id,
    recruiterId: a.recruiter_id,
    jobId: a.job_id,
    stage: a.stage,
    notes: a.notes,
    matchScore: a.match_score,
    outreachSent: a.outreach_sent,
    scheduledInterview: a.scheduled_interview,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

// GET /applications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.currentRole === 'recruiter') {
      filter.recruiter_id = req.currentUser.id;
    } else if (req.currentRole === 'candidate') {
      filter.candidate_id = req.currentUser.id;
    }

    const apps = await Application.find(filter).sort({ created_at: -1 }).lean();
    return res.json(apps.map(applicationToDict));
  } catch (err) { next(err); }
});

// POST /applications
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { candidateId, stage = 'Discovered', jobId, matchScore, notes } = req.body;

    if (!candidateId) {
      return res.status(400).json({ detail: 'candidateId is required' });
    }

    const recruiterId = req.currentRole === 'recruiter' ? req.currentUser.id : 'REC#9901';

    const existing = await Application.findOne({ candidate_id: candidateId, recruiter_id: recruiterId }).lean();

    if (existing) {
      const updates = { stage };
      if (jobId !== undefined) updates.job_id = jobId;
      if (matchScore !== undefined) updates.match_score = matchScore;
      if (notes !== undefined) updates.notes = notes;

      const updated = await Application.findOneAndUpdate(
        { id: existing.id },
        { $set: updates },
        { new: true }
      ).lean();

      return res.json(applicationToDict(updated));
    }

    const newApp = {
      id: generateShortId('app'),
      candidate_id: candidateId,
      recruiter_id: recruiterId,
      job_id: jobId || null,
      stage,
      notes: notes || null,
      match_score: matchScore || null,
      outreach_sent: false,
    };

    const inserted = await Application.create(newApp);
    return res.status(201).json(applicationToDict(inserted.toObject()));
  } catch (err) { next(err); }
});

// PATCH /applications/:id/stage
router.patch('/:id/stage', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, notes, outreachSent, scheduledInterview } = req.body;

    const updates = { stage };
    if (notes !== undefined) updates.notes = notes;
    if (outreachSent !== undefined) updates.outreach_sent = outreachSent;
    if (scheduledInterview !== undefined) updates.scheduled_interview = scheduledInterview;

    const updated = await Application.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ detail: 'Application not found.' });
    return res.json(applicationToDict(updated));
  } catch (err) { next(err); }
});

// POST /applications/apply/:jobId
router.post('/apply/:jobId', requireAuth, requireCandidate, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.currentUser.id;

    const job = await Job.findOne({ id: jobId }).lean();
    const recruiterId = job ? job.posted_by : 'REC#9901';

    const newApp = {
      id: generateShortId('app'),
      candidate_id: candidateId,
      recruiter_id: recruiterId,
      job_id: jobId,
      stage: 'Discovered',
      outreach_sent: false,
    };

    const inserted = await Application.create(newApp);
    return res.status(201).json(applicationToDict(inserted.toObject()));
  } catch (err) { next(err); }
});

module.exports = router;