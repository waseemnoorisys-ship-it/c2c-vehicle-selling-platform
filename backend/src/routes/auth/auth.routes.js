const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/auth/auth.controller");
const validate   = require("../../middleware/validate.middleware");
const { authLimiter } = require("../../middleware/rateLimiter.middleware");
const {
  registerSchema, verifyEmailSchema, resendOtpSchema,
  loginSchema, refreshTokenSchema, forgotPasswordSchema,
  verifyResetOtpSchema, resetPasswordSchema,
} = require("../../validators/auth/auth.validators");

// All auth routes get the strict rate limiter (10 req / 15 min)
router.use(authLimiter);

router.post("/register",         validate(registerSchema),        controller.register);
router.post("/verify-email",     validate(verifyEmailSchema),     controller.verifyEmail);
router.post("/resend-otp",       validate(resendOtpSchema),       controller.resendOtp);
router.post("/login",            validate(loginSchema),           controller.login);
router.post("/refresh-token",    validate(refreshTokenSchema),    controller.refreshToken);
router.post("/logout",           controller.logout);
router.post("/forgot-password",  validate(forgotPasswordSchema),  controller.forgotPassword);
router.post("/verify-reset-otp", validate(verifyResetOtpSchema),  controller.verifyResetOtp);
router.post("/reset-password",   validate(resetPasswordSchema),   controller.resetPassword);

module.exports = router;