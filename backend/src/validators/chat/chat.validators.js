const Joi = require("joi");

const createConversationSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required(),
});

const getConversationSchema = Joi.object({
  conversationId: Joi.string().hex().length(24).required(),
});

const listConversationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const listMessagesSchema = Joi.object({
  conversationId: Joi.string().hex().length(24).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(50),
});

const uploadImageSchema = Joi.object({
  conversationId: Joi.string().hex().length(24).required(),
});

const editMessageSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
  newContent: Joi.string().trim().min(1).max(2000).required(),
});

const deleteMessageSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
});

const blockUserSchema = Joi.object({
  blockedUserId: Joi.string().hex().length(24).required(),
});

const reportConversationSchema = Joi.object({
  conversationId: Joi.string().hex().length(24).required(),
  reason: Joi.string().trim().min(5).max(500).required(),
});

const adminListConversationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  isActive: Joi.boolean().optional(),
  listingId: Joi.string().hex().length(24).optional(),
});

const adminReviewReportSchema = Joi.object({
  reportId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("reviewed", "dismissed").required(),
});

module.exports = {
  createConversationSchema,
  getConversationSchema,
  listConversationsSchema,
  listMessagesSchema,
  uploadImageSchema,
  editMessageSchema,
  deleteMessageSchema,
  blockUserSchema,
  reportConversationSchema,
  adminListConversationsSchema,
  adminReviewReportSchema,
};