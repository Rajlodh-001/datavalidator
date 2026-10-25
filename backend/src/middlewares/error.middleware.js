// Central error handler
const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Something went wrong on the server',
  });
};

// Catch-all for undefined routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
