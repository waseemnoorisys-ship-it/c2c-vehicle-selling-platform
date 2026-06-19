const Joi = require("joi");

const createMakeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
});

const updateMakeSchema = Joi.object({
  name:     Joi.string().trim().min(2).max(50),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createMakeSchema, updateMakeSchema };