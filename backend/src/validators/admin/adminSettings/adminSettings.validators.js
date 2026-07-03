const Joi = require("joi");

const updateSettingsSchema = Joi.object({
  platformName: Joi.string().trim().min(2).max(100).optional(),
  supportEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().trim().max(30).optional().allow(""),
  contactAddress: Joi.string().trim().max(300).optional().allow(""),
  maxPhotosPerListing: Joi.number().integer().min(1).max(20).optional(),
  maintenanceMode: Joi.boolean().optional(),
});

module.exports = { updateSettingsSchema };