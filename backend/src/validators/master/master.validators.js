const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const getMasterSchema = Joi.object({
  master: Joi.string().valid("country", "state", "city").required().messages({
    "any.required": "master is required",
    "any.only":   "Invalid master type — supported: country, state, city",
  }),
  countryId: Joi.alternatives()
    .try(objectId, Joi.number().integer())
    .when("master", { is: Joi.valid("state", "city"), then: Joi.required() }),
  stateId: Joi.number()
    .integer()
    .when("master", { is: "city", then: Joi.required() }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().trim().max(100).optional(),
  sort: Joi.string().default("name"),
  fields: Joi.string().trim().max(200).optional(),
});

module.exports = { getMasterSchema };
