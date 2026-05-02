const userService = require("../services/user.service");

const register = async (req, res, next) => {
  try {
    const data = await userService.registerUser(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register };
