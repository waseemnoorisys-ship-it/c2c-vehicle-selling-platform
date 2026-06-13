const bcrypt        = require("bcryptjs");
const jwt           = require("jsonwebtoken");
const crypto        = require("crypto");
const User          = require("../../models/user/user.model");
const RefreshToken  = require("../../models/refreshToken/refreshToken.model");
const { createOTP, verifyOTP } = require("../otp/otp.service");
const { sendOtpEmail }         = require("../email/email.service");
const ApiError      = require("../../utils/ApiError");

// ─── Token helpers ────────────────────────────────────────
function signAccessToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

async function createRefreshToken(userId, userAgent, ip) {
  const plain    = crypto.randomBytes(64).toString("hex");
  const hash     = crypto.createHash("sha256").update(plain).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({ userId, tokenHash: hash, userAgent, ip, expiresAt });
  return plain; // return plain — stored hashed
}

// ─── Register ─────────────────────────────────────────────
async function register({ firstName, lastName, email, mobile, countryCode, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName, lastName, email, mobile,
    countryCode, passwordHash, role,
  });

  // Create & send OTP
  const otp = await createOTP(user._id, email, "email_verify");
  await sendOtpEmail(email, otp, "email_verify");

  return { userId: user._id, email: user.email };
}

// ─── Verify email ─────────────────────────────────────────
async function verifyEmail({ email, otp }) {
  const user = await User.findActiveByEmail(email);
  if (!user)              throw new ApiError(404, "User not found");
  if (user.isEmailVerified) throw new ApiError(400, "Email already verified");

  await verifyOTP(user._id, "email_verify", otp);

  user.isEmailVerified = true;
  await user.save();

  return { message: "Email verified successfully" };
}

// ─── Resend OTP ───────────────────────────────────────────
async function resendOtp({ email, type }) {
  const user = await User.findActiveByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  if (type === "email_verify" && user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  const otp = await createOTP(user._id, email, type);
  await sendOtpEmail(email, otp, type);
  return { message: "OTP sent" };
}

// ─── Login ────────────────────────────────────────────────
async function login({ email, password }, userAgent, ip) {
  const user = await User.findActiveByEmail(email);
  if (!user) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive)        throw new ApiError(403, "Account is deactivated");
  if (!user.isEmailVerified) throw new ApiError(403, "Please verify your email first");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const accessToken  = signAccessToken(user._id, user.role);
  const refreshToken = await createRefreshToken(user._id, userAgent, ip);

  return {
    user: {
      _id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, role: user.role, profilePhoto: user.profilePhoto,
    },
    accessToken,
    refreshToken,
  };
}

// ─── Refresh token ────────────────────────────────────────
async function refreshAccessToken(plainToken, userAgent, ip) {
  const hash   = crypto.createHash("sha256").update(plainToken).digest("hex");
  const record = await RefreshToken.findOne({
    tokenHash: hash,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) throw new ApiError(401, "Invalid or expired refresh token");

  // Rotate: revoke old, issue new
  record.isRevoked = true;
  await record.save();

  const user = await User.findById(record.userId);
  if (!user || !user.isActive) throw new ApiError(401, "User not found or inactive");

  const accessToken     = signAccessToken(user._id, user.role);
  const newRefreshToken = await createRefreshToken(user._id, userAgent, ip);

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Logout ───────────────────────────────────────────────
async function logout(plainToken) {
  if (!plainToken) return;
  const hash = crypto.createHash("sha256").update(plainToken).digest("hex");
  await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { isRevoked: true });
}

// ─── Forgot password ──────────────────────────────────────
async function forgotPassword({ email }) {
  const user = await User.findActiveByEmail(email);
  // WHY no error if not found: security — don't reveal if email exists
  if (!user) return { message: "If that email exists, an OTP has been sent" };

  const otp = await createOTP(user._id, email, "password_reset");
  await sendOtpEmail(email, otp, "password_reset");
  return { message: "If that email exists, an OTP has been sent" };
}

// ─── Verify reset OTP ─────────────────────────────────────
async function verifyResetOtp({ email, otp }) {
  const user = await User.findActiveByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  await verifyOTP(user._id, "password_reset", otp);

  // Issue a short-lived signed reset token (not stored — stateless)
  const resetToken = jwt.sign(
    { userId: user._id, purpose: "password_reset" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "10m" }
  );

  return { resetToken };
}

// ─── Reset password ───────────────────────────────────────
async function resetPassword({ email, resetToken, newPassword }) {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(400, "Reset token is invalid or expired");
  }

  if (decoded.purpose !== "password_reset") {
    throw new ApiError(400, "Invalid token purpose");
  }

  const user = await User.findActiveByEmail(email);
  if (!user || user._id.toString() !== decoded.userId) {
    throw new ApiError(400, "Token does not match user");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Revoke all refresh tokens for this user (force re-login everywhere)
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

  return { message: "Password reset successfully" };
}

module.exports = {
  register, verifyEmail, resendOtp, login,
  refreshAccessToken, logout,
  forgotPassword, verifyResetOtp, resetPassword,
};