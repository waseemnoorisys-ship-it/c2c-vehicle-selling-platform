const Joi = require("joi");

const listTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("pending", "escrowed", "released", "refunded", "failed")
    .optional(),
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
  buyerId: Joi.string().hex().length(24).optional(),
  vendorId: Joi.string().hex().length(24).optional(),
});

const transactionIdSchema = Joi.object({
  transactionId: Joi.string().hex().length(24).required(),
});

module.exports = { listTransactionsSchema, transactionIdSchema };