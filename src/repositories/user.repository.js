const User = require("../models/user.model");

const create = (payload) => {
  return User.create(payload);
};

const findByEmail = (email) => {
  return User.findOne({ email }).select("_id email name").lean();
};

const findById = (id) => {
  return User.findById(id).select("_id email name").lean();
};

module.exports = {
  create,
  findByEmail,
  findById,
};
