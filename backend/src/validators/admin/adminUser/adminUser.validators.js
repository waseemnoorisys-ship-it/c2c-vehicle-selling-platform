const Joi = require("joi");

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid("buyer", "vendor").optional(),
  search: Joi.string().optional().allow(""),
});

const userIdSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

module.exports = { listUsersSchema, userIdSchema };