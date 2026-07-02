const Joi = require("joi");

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const adminRefreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { adminLoginSchema, adminRefreshSchema };