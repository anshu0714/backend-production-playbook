const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const message =
      err.issues?.map((e) => e.message).join(", ") || "Invalid request data";

    const error = new Error(message);
    error.statusCode = 400;

    next(error);
  }
};

module.exports = validate;
