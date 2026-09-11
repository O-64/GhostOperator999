const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Talent Matrix Node.js API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
