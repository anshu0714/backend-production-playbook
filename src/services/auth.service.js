const bcrypt = require("bcryptjs");

const userRepo = require("../repositories/user.repository");

const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const AppError = require("../utils/appError");

const loginUser = async ({ email, password }) => {
  const user = await userRepo.findByEmailWithPassword(email);

  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password || "");

  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }

  const payload = {
    userId: user._id,
    role: user.role,
  };

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },

    accessToken: generateAccessToken(payload),

    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = {
  loginUser,
};
