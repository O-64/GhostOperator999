const { decodeAccessToken } = require('../utils/security');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');

/**
 * Middleware: Verify JWT and attach current user to req.currentUser
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const token = authHeader.slice(7);
  const payload = decodeAccessToken(token);
  if (!payload) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }

  const { sub: userId, role } = payload;
  if (!userId || !role) {
    return res.status(401).json({ detail: 'Invalid token payload' });
  }

  try {
    const Model = role === 'candidate' ? Candidate : Recruiter;
    const user = await Model.findOne({ id: userId }).lean();

    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.currentUser = user;
    req.currentRole = role;
    next();
  } catch (err) {
    return res.status(500).json({ detail: 'Auth lookup failed' });
  }
}

/** Only allows candidates through */
function requireCandidate(req, res, next) {
  if (req.currentRole !== 'candidate') {
    return res.status(403).json({ detail: 'Candidate access required' });
  }
  next();
}

/** Only allows recruiters through */
function requireRecruiter(req, res, next) {
  if (req.currentRole !== 'recruiter') {
    return res.status(403).json({ detail: 'Recruiter access required' });
  }
  next();
}

module.exports = { requireAuth, requireCandidate, requireRecruiter };