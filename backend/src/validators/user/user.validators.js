const Joi = require("joi");

// WHY no email/role here: those fields are intentionally NOT editable
// through this endpoint (see Sprint 2 explanation — security boundary).
const updateProfileSchema = Joi.object({
  firstName:   Joi.string().trim().min(2).max(50),
  lastName:    Joi.string().trim().min(2).max(50),
  mobile:      Joi.string().pattern(/^\d{6,15}$/),
  countryCode: Joi.string().pattern(/^\+\d{1,4}$/),
  language:    Joi.string().valid("en", "fr"),
}).min(1); // WHY .min(1): at least one field must be sent, otherwise it's a no-op request

module.exports = { updateProfileSchema };   