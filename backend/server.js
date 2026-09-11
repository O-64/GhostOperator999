require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/mongoose');

const authRoutes = require('./src/routes/auth');
const candidateRoutes = require('./src/routes/candidates');
const recruiterRoutes = require('./src/routes/recruiters');
const jobRoutes = require('./src/routes/jobs');
const applicationRoutes = require('./src/routes/applications');
const matchRoutes = require('./src/routes/match');
const copilotRoutes = require('./src/routes/copilot');
const healthRoutes = require('./src/routes/health');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // allow no-origin (curl, Postman) and any LAN/localhost
    if (!origin) return cb(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Body Parser ─────────────────────────────────────────────────────────────
const agentRoutes = require('./src/routes/agents');
const uploadRoutes = require('./src/routes/upload');
const path = require('path');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes (all under /v1) ──────────────────────────────────────────────────
app.use('/v1/health',       healthRoutes);
app.use('/v1/auth',         authRoutes);
app.use('/v1/candidates',   candidateRoutes);
app.use('/v1/recruiters',   recruiterRoutes);
app.use('/v1/jobs',         jobRoutes);
app.use('/v1/applications', applicationRoutes);
app.use('/v1/match',        matchRoutes);
app.use('/v1/copilot',      copilotRoutes);
app.use('/v1/agents',       agentRoutes);
app.use('/v1/upload',       uploadRoutes);

// ─── Root ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'AI Talent Matrix Node.js API', docs: '/v1/health', version: '1.0.0' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Global Error Guards (prevents silent crashes) ───────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception — server will exit:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection at:', promise, '| Reason:', reason);
  process.exit(1);
});

// ─── Start (connect to MongoDB Atlas first, then listen) ─────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[OK] AI Talent Matrix API running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[FATAL] Failed to start server — DB connection error:', err.message);
    process.exit(1);
  });
