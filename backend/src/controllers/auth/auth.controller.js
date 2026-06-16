const authService  = require("../../services/auth/auth.service");
const ApiResponse  = require("../../utils/ApiResponse");

// WHY thin controllers: all logic lives in service.
// Controller only: call service, format response, handle async.

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(new ApiResponse(201, result, "Registration successful. OTP sent to email."));
  } catch (err) { next(err); }
};


const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendOtp(req.body);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(
      req.body,
      req.headers["user-agent"],
      req.ip
    );
    res.status(200).json(new ApiResponse(200, result, "Login successful"));
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(
      req.body.refreshToken,
      req.headers["user-agent"],
      req.ip
    );
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyResetOtp(req.body);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

module.exports = {
  register, verifyEmail, resendOtp, login,
  refreshToken, logout, forgotPassword,
  verifyResetOtp, resetPassword,
};