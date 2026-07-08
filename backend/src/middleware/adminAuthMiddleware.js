const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const AdminUser = require("../models/admin/adminUser.model");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

const authenticateAdmin = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, t("errors.adminAuth.tokenRequired", lang));
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(401, t("errors.adminAuth.invalidToken", lang));
    }

    const admin = await AdminUser.findOne({
      _id: decoded.id,
      deletedAt: null,
      isActive: true,
    });

    if (!admin) {
      throw new ApiError(401, t("errors.adminAuth.notFound", lang));
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticateAdmin };
