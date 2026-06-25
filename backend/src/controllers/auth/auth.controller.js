const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authService = require("../../services/auth/auth.service");
const { createOTP, verifyOTP } = require("../../services/otp/otp.service");
const { sendOtpEmail } = require("../../services/email/email.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

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
    const { firstName, lastName, email, mobile, countryCode, password, role } = req.body;

    const existing = await authService.findByEmail(email);
    if (existing) throw new ApiError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authService.createUser({
      firstName,
      lastName,
      email,
      mobile,
      countryCode,
      passwordHash,
      role,
    });

    const otp = await createOTP(user._id, email, "email_verify");
    await sendOtpEmail(email, otp, "email_verify");

    res.status(201).json(new ApiResponse(201, {
      userId: user._id,
      email: user.email,
    }, "Registration successful. OTP sent to email."));
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, "User not found");
    if (user.isEmailVerified) throw new ApiError(400, "Email already verified");

    await verifyOTP(user._id, "email_verify", otp);

    user.isEmailVerified = true;
    await authService.saveUser(user);

    res.status(200).json(new ApiResponse(200, { message: "Email verified successfully" }));
  } catch (err) { next(err); }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, "User not found");

    if (type === "email_verify" && user.isEmailVerified) {
      throw new ApiError(400, "Email already verified");
    }

    const otp = await createOTP(user._id, email, type);
    await sendOtpEmail(email, otp, type);

    res.status(200).json(new ApiResponse(200, { message: "OTP sent" }));
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");
    if (!user.isEmailVerified) throw new ApiError(403, "Please verify your email first");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id, userAgent, ip);

    res.status(200).json(new ApiResponse(200, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      accessToken,
      refreshToken,
    }, "Login successful"));
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const plainToken = req.body.refreshToken;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const hash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const record = await authService.findRefreshToken({
      tokenHash: hash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) throw new ApiError(401, "Invalid or expired refresh token");

    record.isRevoked = true;
    await authService.saveRefreshToken(record);

    const user = await authService.findById(record.userId);
    if (!user || !user.isActive) throw new ApiError(401, "User not found or inactive");

    const accessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = await createRefreshToken(user._id, userAgent, ip);

    res.status(200).json(new ApiResponse(200, {
      accessToken,
      refreshToken: newRefreshToken,
    }));
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const plainToken = req.body.refreshToken;
    if (plainToken) {
      const hash = crypto.createHash("sha256").update(plainToken).digest("hex");
      await authService.revokeRefreshTokenByHash(hash);
    }

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authService.findActiveByEmail(email);

    if (user) {
      const otp = await createOTP(user._id, email, "password_reset");
      await sendOtpEmail(email, otp, "password_reset");
    }

    res.status(200).json(new ApiResponse(200, {
      message: "If that email exists, an OTP has been sent",
    }));
  } catch (err) { next(err); }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await authService.findActiveByEmail(email);
    if (!user) throw new ApiError(404, "User not found");

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

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
    } catch {
      throw new ApiError(400, "Reset token is invalid or expired");
    }

    if (decoded.purpose !== "password_reset") {
      throw new ApiError(400, "Invalid token purpose");
    }

    const user = await authService.findActiveByEmail(email);
    if (!user || user._id.toString() !== decoded.userId) {
      throw new ApiError(400, "Token does not match user");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await authService.saveUser(user);
    await authService.revokeAllRefreshTokensForUser(user._id);

    res.status(200).json(new ApiResponse(200, { message: "Password reset successfully" }));
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
