const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const getNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  unread: Joi.boolean().optional(),
});

const readNotificationSchema = Joi.object({
  id: objectId.required().messages({
    "any.required": "Notification id is required",
  }),
});

module.exports = {
  getNotificationsSchema,
  readNotificationSchema,
};