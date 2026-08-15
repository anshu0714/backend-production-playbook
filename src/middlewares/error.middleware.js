const multer = require("multer");

const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { NODE_ENV } = require("../config/env");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    err = new AppError(err.message, 400);
  }

  err.statusCode = err.statusCode || 500;

  if (err.statusCode >= 500) {
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

  if (NODE_ENV === "development") {
    return sendDevError(err, res);
  }

  return sendProdError(err, res);
};
