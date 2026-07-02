const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminAuthService = require("../../../services/admin/adminAuth/adminAuth.service");
const { adminLoginSchema, adminRefreshSchema } = require("../../../validators/admin/adminAuth/adminAuth.validators");

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
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = value;

    const admin = await adminAuthService.findAdminByEmail(email);
    if (!admin) throw new ApiError(401, "Invalid credentials");

    if (!admin.isActive) throw new ApiError(403, "Admin account is deactivated");

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

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
        "Admin login successful"
      )
    );
  } catch (err) {
    next(err);
  }
};

const adminRefreshToken = async (req, res, next) => {
  try {
    const { error, value } = adminRefreshSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { refreshToken } = value;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_ADMIN_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    if (decoded.type !== "admin") throw new ApiError(401, "Invalid token type");

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored = await adminAuthService.findAdminRefreshToken(tokenHash);
    if (!stored) throw new ApiError(401, "Refresh token revoked or not found");

    const admin = await adminAuthService.findAdminById(decoded.id);
    if (!admin) throw new ApiError(401, "Admin not found");

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
        "Token refreshed"
      )
    );
  } catch (err) {
    next(err);
  }
};

const adminLogout = async (req, res, next) => {
  try {
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
      .json(new ApiResponse(200, {}, "Admin logged out successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = { adminLogin, adminRefreshToken, adminLogout };