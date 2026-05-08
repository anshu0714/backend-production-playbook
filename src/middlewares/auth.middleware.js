const { verifyAccessToken } = require("../utils/token");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const token = header.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;

    next(error);
  }
};

module.exports = auth;
