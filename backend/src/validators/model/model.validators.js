const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const listModelsSchema = Joi.object({
  makeId: objectId,
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(200).default(100),
});

const getModelByIdSchema = Joi.object({
  id: objectId.required(),
});

const createModelSchema = Joi.object({
  makeId: objectId.required().messages({
    "string.length": "makeId must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().trim().min(1).max(50).required(),
});

const updateModelSchema = Joi.object({
  id:       objectId.required(),
  name:     Joi.string().trim().min(1).max(50),
  isActive: Joi.boolean(),
}).min(2);

const deleteModelSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  listModelsSchema,
  getModelByIdSchema,
  createModelSchema,
  updateModelSchema,
  deleteModelSchema,
};
