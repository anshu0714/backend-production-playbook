const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const loginUser = async ({ email, password }) => {
  const user = await userRepo.findByEmailWithPassword(email);

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password || "");

  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    throw err;
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
