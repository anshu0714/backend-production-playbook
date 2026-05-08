const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");

const registerUser = async (payload) => {
  const exists = await userRepo.findByEmail(payload.email);

  if (exists) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
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
