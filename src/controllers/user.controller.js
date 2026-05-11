const userService = require("../services/user.service");

const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const data = await userService.registerUser(req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

module.exports = {
  register,
};
