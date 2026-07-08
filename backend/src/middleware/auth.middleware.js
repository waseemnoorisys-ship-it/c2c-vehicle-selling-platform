const jwt     = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User    = require("../models/user/user.model");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

async function authenticate(req, res, next) {
  try {
    const lang = getLang(req);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, t("errors.auth.noToken", lang));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user)          throw new ApiError(401, t("errors.auth.userNotFound", lang));
    if (!user.isActive) throw new ApiError(403, t("errors.auth.accountDeactivated", user.language || lang));
    if (user.deletedAt) throw new ApiError(403, t("errors.auth.accountDeleted", user.language || lang));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const lang = getLang(req);
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, t("errors.common.forbidden", lang)));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
