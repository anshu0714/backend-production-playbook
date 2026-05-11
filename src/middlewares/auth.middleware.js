const { verifyAccessToken } = require("../utils/token");

const AppError = require("../utils/appError");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = header.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = auth;
