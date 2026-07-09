const Joi = require("joi");

const listListingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("draft", "pending", "approved", "rejected", "sold", "inactive")
    .optional(),

    dateFrom:Joi.date().iso().optional(),
    dateTo:Joi.date().iso().when('dateFrom', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('dateFrom'))
    }),
  
});

const listingIdSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required(),
});

const rejectListingSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required(),
  rejectionReason: Joi.string().trim().min(5).max(500).required(),
});

module.exports = { listListingsSchema, listingIdSchema, rejectListingSchema };