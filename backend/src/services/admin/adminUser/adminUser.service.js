const User = require("../../../models/user/user.model");

async function findAllUsers(filter, skip, limit) {
  return User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countUsers(filter) {
  return User.countDocuments(filter);
}

async function findUserById(id) {
  return User.findOne({ _id: id, deletedAt: null }).select("-passwordHash");
}

async function updateUserById(id, update) {
  return User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash");
}

module.exports = {
  findAllUsers,
  countUsers,
  findUserById,
  updateUserById,
};