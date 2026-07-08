const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authService = require("../../services/auth/auth.service");
const { createOTP, verifyOTP } = require("../../services/otp/otp.service");
const { sendEmail } = require("../../services/email/email.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

function signAccessToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

async function createRefreshToken(userId, userAgent, ip) {
  const plain = crypto.randomBytes(64).toString("hex");
  const hash = crypto.createHash("sha256").update(plain).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authService.createRefreshTokenRecord({
    userId,
    tokenHash: hash,
    userAgent,
    ip,
    expiresAt,
  });

  return plain;
}

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile, countryCode, password, role, language } = req.body;
    const lang = language || getLang(req);

    const existing = await authService.findByEmail(email);
    if (existing) throw new ApiError(409, t("errors.auth.emailRegistered", lang));

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authService.createUser({
      firstName,
      lastName,
      email,
      mobile,
      countryCode,
      passwordHash,
      role,
      language: lang,
    });

    const otp = await createOTP(user._id, email, "email_verify");
    await sendEmail({
      to: email,
      templateName: "otp",
      data: { otp, lang },
    });

    res.status(201).json(new ApiResponse(201, {
      userId: user._id,
      email: user.email,
    }, t("success.auth.register", lang)));
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lang = getLang(req);

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, t("errors.auth.userNotFound", lang));
    if (user.isEmailVerified) throw new ApiError(400, t("errors.auth.emailAlreadyVerified", user.language || lang));

    await verifyOTP(user._id, "email_verify", otp);

    user.isEmailVerified = true;
    await authService.saveUser(user);

    const userLang = user.language || lang;
    res.status(200).json(new ApiResponse(200, { message: t("success.auth.emailVerified", userLang) }, t("success.auth.emailVerified", userLang)));
  } catch (err) { next(err); }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const lang = getLang(req);

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, t("errors.auth.userNotFound", lang));

    const userLang = user.language || lang;
    if (type === "email_verify" && user.isEmailVerified) {
      throw new ApiError(400, t("errors.auth.emailAlreadyVerified", userLang));
    }

    const otp = await createOTP(user._id, email, type);
    await sendEmail({
      to: email,
      templateName: "otp",
      data: { otp, lang: userLang },
    });

    res.status(200).json(new ApiResponse(200, { message: t("success.auth.otpSent", userLang) }, t("success.auth.otpSent", userLang)));
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lang = getLang(req);
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(401, t("errors.auth.invalidCredentials", lang));
    if (!user.isActive) throw new ApiError(403, t("errors.auth.accountDeactivated", user.language || lang));
    if (!user.isEmailVerified) throw new ApiError(403, t("errors.auth.verifyEmailFirst", user.language || lang));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, t("errors.auth.invalidCredentials", user.language || lang));

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id, userAgent, ip);
    const userLang = user.language || lang;

    res.status(200).json(new ApiResponse(200, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        language: userLang,
      },
      accessToken,
      refreshToken,
    }, t("success.auth.login", userLang)));
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const plainToken = req.body.refreshToken;
    const lang = getLang(req);
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const hash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const record = await authService.findRefreshToken({
      tokenHash: hash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) throw new ApiError(401, t("errors.auth.invalidRefreshToken", lang));

    record.isRevoked = true;
    await authService.saveRefreshToken(record);

    const user = await authService.findById(record.userId);
    if (!user || !user.isActive) throw new ApiError(401, t("errors.auth.userInactive", lang));

    const accessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = await createRefreshToken(user._id, userAgent, ip);
    const userLang = user.language || lang;

    res.status(200).json(new ApiResponse(200, {
      accessToken,
      refreshToken: newRefreshToken,
    }, t("success.auth.tokenRefreshed", userLang)));
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const plainToken = req.body.refreshToken;
    if (plainToken) {
      const hash = crypto.createHash("sha256").update(plainToken).digest("hex");
      await authService.revokeRefreshTokenByHash(hash);
    }

    res.status(200).json(new ApiResponse(200, null, t("success.auth.logout", lang)));
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lang = getLang(req);
    const user = await authService.findActiveByEmail(email);

    if (user) {
      const otp = await createOTP(user._id, email, "password_reset");
      await sendEmail({
        to: email,
        templateName: "otp",
        data: { otp, lang: user.language || lang },
      });
    }

    res.status(200).json(new ApiResponse(200, {
      message: t("success.auth.forgotPassword", lang),
    }, t("success.auth.forgotPassword", lang)));
  } catch (err) { next(err); }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lang = getLang(req);

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, t("errors.auth.userNotFound", lang));

    await verifyOTP(user._id, "password_reset", otp);

    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password_reset" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json(new ApiResponse(200, { resetToken }));
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const lang = getLang(req);

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
    } catch {
      throw new ApiError(400, t("errors.auth.invalidResetToken", lang));
    }

    if (decoded.purpose !== "password_reset") {
      throw new ApiError(400, t("errors.auth.invalidTokenPurpose", lang));
    }

    const user = await authService.findActiveByEmail(email);
    if (!user || user._id.toString() !== decoded.userId) {
      throw new ApiError(400, t("errors.auth.tokenUserMismatch", lang));
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await authService.saveUser(user);
    await authService.revokeAllRefreshTokensForUser(user._id);

    const userLang = user.language || lang;
    res.status(200).json(new ApiResponse(200, { message: t("success.auth.passwordReset", userLang) }, t("success.auth.passwordReset", userLang)));

  } catch (err) { next(err); }
};

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
