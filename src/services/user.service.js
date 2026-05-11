const bcrypt = require("bcryptjs");

const userRepo = require("../repositories/user.repository");

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

module.exports = {
  registerUser,
};
