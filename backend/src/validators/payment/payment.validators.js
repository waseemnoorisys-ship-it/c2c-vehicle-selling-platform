const Joi = require("joi");

//right credentials for creating a payment intent
const createIntentSchema = Joi.object({
  offerId: Joi.string().hex().length(24).required(),
});

//Ensures a valid transactionId is provided before confirming delivery and releasing funds
const confirmDeliverySchema = Joi.object({
  transactionId: Joi.string().hex().length(24).required(),
});

//Ensures the user sends a valid transactionId before fetching transaction details
const getTransactionSchema = Joi.object({
  transactionId: Joi.string().hex().length(24).required(),
});

module.exports = {
  createIntentSchema,
  confirmDeliverySchema,
  getTransactionSchema,
};