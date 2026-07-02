const Joi = require("joi");

const updateCommissionSchema = Joi.object({
  percentage: Joi.number().min(0).max(50).required(),
});

module.exports = { updateCommissionSchema };