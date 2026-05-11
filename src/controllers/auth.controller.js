const authService = require("../services/auth.service");

const catchAsync = require("../utils/catchAsync");

const login = catchAsync(async (req, res) => {
  const tokens = await authService.loginUser(req.body);

  res.json({
    success: true,
    data: tokens,
  });
});

module.exports = {
  login,
};
