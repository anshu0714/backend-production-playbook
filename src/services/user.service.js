const bcrypt = require("bcryptjs");

const userRepo = require("../repositories/user.repository");

const { getCache, setCache } = require("../utils/cache");

const AppError = require("../utils/appError");

const registerUser = async (payload) => {
  const exists = await userRepo.findByEmail(payload.email);

  if (exists) {
    throw new AppError("Email already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await userRepo.create({
    ...payload,
    password: hashedPassword,
  });

  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
};

const getUserProfile = async (userId) => {
  const cacheKey = `user:${userId}`;

  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await setCache(cacheKey, user);

  return user;
};

module.exports = {
  registerUser,
  getUserProfile,
};
