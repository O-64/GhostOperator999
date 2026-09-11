const router = require('express').Router();

const AI_AGENT_SERVICE_URL = process.env.AI_AGENT_SERVICE_URL || 'http://127.0.0.1:8001';

// Helper function to proxy requests to Python AI Agent service
async function forwardToAgentService(endpoint, req, res) {
  try {
    const url = `${AI_AGENT_SERVICE_URL}/api/agents${endpoint}`;
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error(`[AGENT PROXY ERROR] Failed to connect to ${AI_AGENT_SERVICE_URL}:`, err.message);
    return res.status(503).json({
      error: 'AI Agent Service Unavailable',
      message: err.message,
      targetUrl: `${AI_AGENT_SERVICE_URL}/api/agents${endpoint}`,
    });
  }
}

// ─── 1. Resume Agent (Extraction) ─────────────────────────────────────────────
router.post('/resume/parse', async (req, res) => {
  return forwardToAgentService('/resume/parse', req, res);
});

// ─── 2. Job Agent (Requirements) ──────────────────────────────────────────────
router.post('/job/analyze', async (req, res) => {
  return forwardToAgentService('/job/analyze', req, res);
});

// ─── 3. Matching Agent (Multi-dimensional compatibility) ──────────────────────
router.post('/match', async (req, res) => {
  return forwardToAgentService('/match', req, res);
});

// ─── 4. Skill Gap Agent (Missing/weak skills & upskilling) ────────────────────
router.post('/skill-gap', async (req, res) => {
  return forwardToAgentService('/skill-gap', req, res);
});

// ─── 5. Recruiter Agent (Executive brief & interview questions) ───────────────
router.post('/recruiter-summary', async (req, res) => {
  return forwardToAgentService('/recruiter-summary', req, res);
});

// ─── 6. Coordinator Agent (Full End-to-End Multi-Agent Pipeline) ──────────────
router.post('/pipeline/run', async (req, res) => {
  return forwardToAgentService('/pipeline/run', req, res);
});

// ─── 7. AI Mock Interview Agent ──────────────────────────────────────────────
router.post('/interview/start', async (req, res) => {
  return forwardToAgentService('/interview/start', req, res);
});

router.post('/interview/respond', async (req, res) => {
  return forwardToAgentService('/interview/respond', req, res);
});

// ─── 8. AI PPT Analyzer & Presentation Intelligence ───────────────────────────
router.post('/ppt/analyze', async (req, res) => {
  return forwardToAgentService('/ppt/analyze', req, res);
});

// ─── 9. Trust & Fraud Prevention System ───────────────────────────────────────
router.post('/fraud/check', async (req, res) => {
  return forwardToAgentService('/fraud/check', req, res);
});

// ─── 10. Team & GitHub Contribution Analytics ─────────────────────────────────
router.post('/github/analyze', async (req, res) => {
  return forwardToAgentService('/github/analyze', req, res);
});

// ─── 11. Hackathon-to-Hiring Pipeline ────────────────────────────────────────
router.get('/hackathon/data', async (req, res) => {
  return forwardToAgentService('/hackathon/data', req, res);
});

// ─── 12. Benchmark Demo (10 Resumes x 3 Jobs Ranking) ─────────────────────────
router.post('/benchmark/run', async (req, res) => {
  return forwardToAgentService('/benchmark/run', req, res);
});

// ─── 13. Recruiter AI Copilot Enhanced ────────────────────────────────────────
router.post('/copilot/nl-search', async (req, res) => {
  return forwardToAgentService('/copilot/nl-search', req, res);
});

module.exports = router;
