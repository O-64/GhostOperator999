const router = require('express').Router();
const Recruiter = require('../models/Recruiter');
const { requireAuth } = require('../middleware/auth');

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

// PATCH /recruiters/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.currentRole === 'recruiter' && req.currentUser.id !== id) {
      return res.status(403).json({ detail: 'You can only update your own profile.' });
    }

    const fieldMap = {
      name: 'name',
      company: 'company',
      title: 'title',
      industry: 'industry',
      teamSize: 'team_size',
      website: 'website',
      logoUrl: 'logo_url',
      companyDescription: 'company_description',
      headquarters: 'headquarters',
    };

    const updates = {};
    for (const [apiKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[apiKey] !== undefined) updates[dbKey] = req.body[apiKey];
    }

    const updated = await Recruiter.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!updated) return res.status(404).json({ detail: 'Recruiter not found.' });

    return res.json(recruiterToDict(updated));
  } catch (err) { next(err); }
});

module.exports = router;