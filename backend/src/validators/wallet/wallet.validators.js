const Joi = require("joi");

const createBankDetailsSchema = Joi.object({
  accountHolderName: Joi.string().trim().min(2).max(100).required(),
  accountNumber: Joi.string().trim().min(6).max(34).required(),
  ifscOrRouting: Joi.string().trim().min(4).max(34).required(),
  bankName: Joi.string().trim().min(2).max(100).required(),
});

const createWithdrawalSchema = Joi.object({
  amount: Joi.number().integer().min(100).required(),
});

const getWithdrawalSchema = Joi.object({
  withdrawalId: Joi.string().hex().length(24).required(),
});

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const getInvoiceSchema = Joi.object({
  transactionId: Joi.string().hex().length(24).required(),
});

module.exports = {
  createBankDetailsSchema,
  createWithdrawalSchema,
  getWithdrawalSchema,
  listSchema,
  getInvoiceSchema,
};