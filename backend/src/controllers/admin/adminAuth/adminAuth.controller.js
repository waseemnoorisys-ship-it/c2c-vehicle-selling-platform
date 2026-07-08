const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminAuthService = require("../../../services/admin/adminAuth/adminAuth.service");
const { adminLoginSchema, adminRefreshSchema } = require("../../../validators/admin/adminAuth/adminAuth.validators");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");

function generateAdminAccessToken(admin) {
  return jwt.sign(
    { id: admin._id, role: admin.role, type: "admin" },
    process.env.JWT_ADMIN_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function generateAdminRefreshToken(admin) {
  return jwt.sign(
    { id: admin._id, type: "admin" },
    process.env.JWT_ADMIN_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}

const adminLogin = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = value;

    const admin = await adminAuthService.findAdminByEmail(email);
    if (!admin) throw new ApiError(401, t("errors.adminAuth.invalidCredentials", lang));

    if (!admin.isActive) throw new ApiError(403, t("errors.adminAuth.deactivated", lang));

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) throw new ApiError(401, t("errors.adminAuth.invalidCredentials", lang));

    const accessToken = generateAdminAccessToken(admin);
    const refreshToken = generateAdminRefreshToken(admin);

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await adminAuthService.saveAdminRefreshToken({
      userId: admin._id,
      tokenHash,
      userType: "admin",
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await adminAuthService.updateAdminLastLogin(admin._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          admin: {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
          },
        },
        t("success.admin.login", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const adminRefreshToken = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = adminRefreshSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { refreshToken } = value;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_ADMIN_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, t("errors.adminAuth.invalidToken", lang));
    }

    if (decoded.type !== "admin") throw new ApiError(401, t("errors.adminAuth.invalidToken", lang));

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored = await adminAuthService.findAdminRefreshToken(tokenHash);
    if (!stored) throw new ApiError(401, t("errors.adminAuth.invalidToken", lang));

    const admin = await adminAuthService.findAdminById(decoded.id);
    if (!admin) throw new ApiError(401, t("errors.adminAuth.notFound", lang));

    await adminAuthService.revokeAdminRefreshToken(tokenHash);

    const newAccessToken = generateAdminAccessToken(admin);
    const newRefreshToken = generateAdminRefreshToken(admin);

    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await adminAuthService.saveAdminRefreshToken({
      userId: admin._id,
      tokenHash: newHash,
      userType: "admin",
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        t("success.admin.tokenRefreshed", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const adminLogout = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = adminRefreshSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { refreshToken } = value;

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await adminAuthService.revokeAdminRefreshToken(tokenHash);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, t("success.admin.logout", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { adminLogin, adminRefreshToken, adminLogout };
