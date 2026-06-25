const Joi = require("joi");

const getMyOffersSchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const createOfferSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required().messages({
    "string.hex":   "listingId must be a valid MongoDB ObjectId",
    "any.required": "listingId is required",
  }),
  amount: Joi.number().integer().min(1).required().messages({
    "number.integer": "Amount must be an integer (in cents, e.g. $10,500 = 1050000)",
    "number.min":     "Amount must be at least 1 cent",
    "any.required":   "Offer amount is required",
  }),
  message: Joi.string().trim().max(500).optional().messages({
    "string.max": "Message cannot exceed 500 characters",
  }),
});

module.exports = { createOfferSchema, getMyOffersSchema };
