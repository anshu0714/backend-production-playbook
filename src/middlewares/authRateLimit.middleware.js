const rateLimit = require("express-rate-limit");

const AppError = require("../utils/appError");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res, next) => {
    next(new AppError("Too many login attempts. Please try later.", 429));
  },
});

module.exports = authLimiter;
