const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.message, {
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
    });
  } else {
    logger.warn(err.message, {
      method: req.method,
      path: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
