const Joi = require("joi");

const listWithdrawalsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("pending", "approved", "paid", "rejected")
    .optional(),
});

const withdrawalIdSchema = Joi.object({
  withdrawalId: Joi.string().hex().length(24).required(),
});

const rejectWithdrawalSchema = Joi.object({
  withdrawalId: Joi.string().hex().length(24).required(),
  rejectionReason: Joi.string().trim().min(5).max(500).required(),
});

module.exports = {
  listWithdrawalsSchema,
  withdrawalIdSchema,
  rejectWithdrawalSchema,
};