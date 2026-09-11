function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ detail: err.message || 'Internal server error' });
}

module.exports = errorHandler;
