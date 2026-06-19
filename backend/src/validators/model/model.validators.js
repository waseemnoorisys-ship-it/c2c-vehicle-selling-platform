const Joi = require("joi");

// WHY makeId required here: every model MUST belong to a make.
// You can't create "Civic" floating in space — it needs a parent.
const createModelSchema = Joi.object({
  makeId: Joi.string().hex().length(24).required().messages({
    "string.length": "makeId must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().trim().min(1).max(50).required(),
});

const updateModelSchema = Joi.object({
  name:     Joi.string().trim().min(1).max(50),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createModelSchema, updateModelSchema };