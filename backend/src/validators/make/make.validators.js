const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const listMakesSchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

const getMakeByIdSchema = Joi.object({
  id: objectId.required(),
});

const createMakeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
});

const updateMakeSchema = Joi.object({
  id:       objectId.required(),
  name:     Joi.string().trim().min(2).max(50),
  isActive: Joi.boolean(),
}).min(2);

const deleteMakeSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  listMakesSchema,
  getMakeByIdSchema,
  createMakeSchema,
  updateMakeSchema,
  deleteMakeSchema,
};
