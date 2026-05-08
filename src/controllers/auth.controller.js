const authService = require("../services/auth.service");

const login = async (req, res, next) => {
  try {
    const tokens = await authService.loginUser(req.body);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
