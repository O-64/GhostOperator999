const router = require('express').Router();
const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');
const { generateShortId } = require('../utils/idGenerator');

function jobToDict(j) {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    type: j.type,
    skills: j.skills || [],
    location: j.location || '',
    salary: j.salary || '',
    postedBy: j.posted_by,
    postedAt: j.posted_at || j.created_at,
    description: j.description || '',
  };
}

// GET /jobs
router.get('/', async (req, res, next) => {
  try {
    const { recruiterId } = req.query;
    const filter = {};
    if (recruiterId) filter.posted_by = recruiterId;

    const jobs = await Job.find(filter).sort({ posted_at: -1 }).lean();
    return res.json(jobs.map(jobToDict));
  } catch (err) { next(err); }
});

// POST /jobs
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, company, type = 'job', skills = [], location = '', salary = '', description = '' } = req.body;

    if (!title) {
      return res.status(400).json({ detail: 'Job title is required' });
    }

    const newJob = {
      id: generateShortId('job'),
      title,
      company: company || (req.currentUser ? req.currentUser.company : 'Enterprise'),
      type,
      skills: Array.isArray(skills) ? skills : [],
      location,
      salary,
      posted_by: req.currentUser.id,
      description,
      posted_at: new Date(),
    };

    const inserted = await Job.create(newJob);
    return res.status(201).json(jobToDict(inserted.toObject()));
  } catch (err) { next(err); }
});

module.exports = router;