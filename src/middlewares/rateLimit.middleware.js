const rateLimit = require("express-rate-limit");

const AppError = require("../utils/appError");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res, next) => {
    next(new AppError("Too many requests. Please try again later.", 429));
  },
});

module.exports = apiLimiter;
