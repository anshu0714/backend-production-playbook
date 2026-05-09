const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const err = new Error("Unauthorized");
        err.statusCode = 401;
        throw err;
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = authorize;
