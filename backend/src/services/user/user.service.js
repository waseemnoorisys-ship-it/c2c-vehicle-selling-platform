const User = require("../../models/user/user.model");

async function findById(userId) {
  return User.findById(userId);
}

async function findByIdAndUpdate(userId, updates, options = {}) {
  return User.findByIdAndUpdate(userId, updates, {
    new: true,
    //what is run validators?
    //run validators is a boolean that tells mongoose to run the validators on the update
    runValidators: true,
    ...options,
  }).select("-passwordHash");
}

async function save(user) {
  return user.save();
}

module.exports = { findById, findByIdAndUpdate, save };
