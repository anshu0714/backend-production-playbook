const AppError = require("../utils/appError");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);

    next();
  } catch (err) {
    const message =
      err.issues?.map((e) => e.message).join(", ") || "Invalid request data";

    next(new AppError(message, 400));
  }
};

module.exports = validate;
