const AdminUser = require("../../../models/admin/adminUser.model");
const RefreshToken = require("../../../models/refreshToken/refreshToken.model");

async function findAdminByEmail(email) {
  return AdminUser.findOne({ email, deletedAt: null });
}

async function findAdminById(id) {
  return AdminUser.findOne({ _id: id, deletedAt: null });
}

async function updateAdminLastLogin(id) {
  return AdminUser.findByIdAndUpdate(id, { lastLoginAt: new Date() });
}

async function saveAdminRefreshToken(data) {
  return RefreshToken.create(data);
}

async function findAdminRefreshToken(tokenHash) {
  return RefreshToken.findOne({ tokenHash, userType: "admin", isRevoked: false });
}

async function revokeAdminRefreshToken(tokenHash) {
  return RefreshToken.findOneAndUpdate(
    { tokenHash, userType: "admin" },
    { isRevoked: true }
  );
}

async function revokeAllAdminRefreshTokens(userId) {
  return RefreshToken.updateMany(
    { userId, userType: "admin", isRevoked: false },
    { isRevoked: true }
  );
}

module.exports = {
  findAdminByEmail,
  findAdminById,
  updateAdminLastLogin,
  saveAdminRefreshToken,
  findAdminRefreshToken,
  revokeAdminRefreshToken,
  revokeAllAdminRefreshTokens,
};