const Joi = require("joi");

const registerSchema = Joi.object({
  firstName:   Joi.string().trim().min(2).max(50).required(),
  lastName:    Joi.string().trim().min(2).max(50).required(),
  email:       Joi.string().email().lowercase().required(),
  mobile:      Joi.string().pattern(/^\d{6,15}$/).required().messages({
    "string.pattern.base": "Mobile must be 6-15 digits",
  }),
  countryCode: Joi.string().pattern(/^\+\d{1,4}$/).default("+33"),
  password:    Joi.string().min(8).max(72).required(),  // 72 = bcrypt max
  role:        Joi.string().valid("buyer", "vendor").required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp:   Joi.string().length(6).pattern(/^\d+$/).required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  type:  Joi.string().valid("email_verify", "password_reset").required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyResetOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp:   Joi.string().length(6).pattern(/^\d+$/).required(),
});

const resetPasswordSchema = Joi.object({
  email:       Joi.string().email().required(),
  resetToken:  Joi.string().required(),
  newPassword: Joi.string().min(8).max(72).required(),
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
};