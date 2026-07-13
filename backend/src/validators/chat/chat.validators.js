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

module.exports = {
  createConversationSchema,
  getConversationSchema,
  listConversationsSchema,
  listMessagesSchema,
  uploadImageSchema,
};