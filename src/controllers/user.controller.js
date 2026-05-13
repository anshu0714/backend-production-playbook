const userService = require("../services/user.service");

const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const data = await userService.registerUser(req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.userId);

  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  getProfile,
};
