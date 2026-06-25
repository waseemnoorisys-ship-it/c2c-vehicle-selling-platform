const User = require("../../models/user/user.model");
const RefreshToken = require("../../models/refreshToken/refreshToken.model");

async function findByEmail(email) {
  return User.findOne({ email });
}

async function findActiveByEmail(email) {
  return User.findActiveByEmail(email);
}

async function findById(userId) {
  return User.findById(userId);
}

async function createUser(data) {
  return User.create(data);
}

async function saveUser(user) {
  return user.save();
}

async function createRefreshTokenRecord(data) {
  return RefreshToken.create(data);
}

async function findRefreshToken(filter) {
  return RefreshToken.findOne(filter);
}

async function saveRefreshToken(record) {
  return record.save();
}

async function revokeRefreshTokenByHash(hash) {
  return RefreshToken.findOneAndUpdate({ tokenHash: hash }, { isRevoked: true });
}

async function revokeAllRefreshTokensForUser(userId) {
  return RefreshToken.updateMany({ userId }, { isRevoked: true });
}

module.exports = {
  findByEmail,
  findActiveByEmail,
  findById,
  createUser,
  saveUser,
  createRefreshTokenRecord,
  findRefreshToken,
  saveRefreshToken,
  revokeRefreshTokenByHash,
  revokeAllRefreshTokensForUser,
};
