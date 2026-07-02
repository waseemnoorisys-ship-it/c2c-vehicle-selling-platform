const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const AdminUser = require("../models/admin/adminUser.model");

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Admin access token required");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired admin token");
    }

    const admin = await AdminUser.findOne({
      _id: decoded.id,
      deletedAt: null,
      isActive: true,
    });

    if (!admin) {
      throw new ApiError(401, "Admin not found or deactivated");
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticateAdmin };