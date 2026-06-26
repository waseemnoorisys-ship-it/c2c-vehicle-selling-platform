// const Joi = require("joi");

// const getMyOffersSchema = Joi.object({
//   page:  Joi.number().integer().min(1).default(1),
//   limit: Joi.number().integer().min(1).max(50).default(20),
// });

// const createOfferSchema = Joi.object({
//   listingId: Joi.string().hex().length(24).required().messages({
//     "string.hex":   "listingId must be a valid MongoDB ObjectId",
//     "any.required": "listingId is required",
//   }),
//   amount: Joi.number().integer().min(1).required().messages({
//     "number.integer": "Amount must be an integer (in cents, e.g. $10,500 = 1050000)",
//     "number.min":     "Amount must be at least 1 cent",
//     "any.required":   "Offer amount is required",
//   }),
//   message: Joi.string().trim().max(500).optional().messages({
//     "string.max": "Message cannot exceed 500 characters",
//   }),
// });


// module.exports = { createOfferSchema, getMyOffersSchema };

// src/validators/offer/offer.validators.js
// Sprint 3: createOfferSchema
// Sprint 4: acceptOfferSchema, rejectOfferSchema, getOfferSchema,
//           receivedOffersSchema added

const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

// ── Sprint 3 ──────────────────────────────────────────────────────
// WHY integer amount: cents only — no decimals.
// Frontend converts: $10,500 → send 1050000
const createOfferSchema = Joi.object({
  listingId: objectId.required().messages({
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

// ── Sprint 4 ──────────────────────────────────────────────────────

// WHY id in body: per architecture decision, all IDs go in req.body.
// No req.params used anywhere in this project.
const acceptOfferSchema = Joi.object({
  id: objectId.required().messages({
    "any.required": "Offer id is required",
  }),
});

const rejectOfferSchema = Joi.object({
  id: objectId.required().messages({
    "any.required": "Offer id is required",
  }),
  // WHY optional reason: vendor can explain the rejection.
  // Buyer sees this in their notification. Builds trust.
  reason: Joi.string().trim().max(500).optional(),
});

const getOfferSchema = Joi.object({
  id: objectId.required().messages({
    "any.required": "Offer id is required",
  }),
});

// WHY validate filter body: vendor might send invalid status string
// or non-ObjectId listingId — catch it before hitting DB.
const receivedOffersSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "accepted", "rejected", "expired", "withdrawn")
    .optional(),
  listingId: objectId.optional(),
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(50).default(20),
});

module.exports = {
  createOfferSchema,
  acceptOfferSchema,
  rejectOfferSchema,
  getOfferSchema,
  receivedOffersSchema,
};