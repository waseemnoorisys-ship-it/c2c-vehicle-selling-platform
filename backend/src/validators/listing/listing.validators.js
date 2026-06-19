const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

// WHY this schema covers BOTH "draft" and "submit" creation:
// the controller decides the status based on a separate query param
// or body flag — see listing.service.js create() function.
const createListingSchema = Joi.object({
  makeId:              objectId.required(),
  modelId:             objectId.required(),
  year:                Joi.number().integer().min(1950).max(new Date().getFullYear() + 1).required(),
  registrationNumber:  Joi.string().trim().allow("").max(30),
  mileage:             Joi.number().min(0).required(),
  fuelType:            Joi.string().valid("petrol", "diesel", "gas", "electric", "hybrid", "hydrogen").required(),
  transmission:        Joi.string().valid("manual", "automatic", "semi-automatic").required(),
  condition:           Joi.string().valid("new", "used").default("used"),
  askingPrice:         Joi.number().min(0).required(),
  locationText:        Joi.string().trim().max(200).allow(""),
  latitude:            Joi.number().min(-90).max(90),
  longitude:           Joi.number().min(-180).max(180),
  // WHY this flag: tells the service whether to save as "draft" or "pending"
  submitForApproval:   Joi.boolean().default(false),
});

// WHY update schema has fewer .required(): PATCH means partial update —
// vendor might only want to change the price, not resend everything.
const updateListingSchema = Joi.object({
  makeId:              objectId,
  modelId:             objectId,
  year:                Joi.number().integer().min(1950).max(new Date().getFullYear() + 1),
  registrationNumber:  Joi.string().trim().allow("").max(30),
  mileage:             Joi.number().min(0),
  fuelType:            Joi.string().valid("petrol", "diesel", "gas", "electric", "hybrid", "hydrogen"),
  transmission:        Joi.string().valid("manual", "automatic", "semi-automatic"),
  condition:           Joi.string().valid("new", "used"),
  askingPrice:         Joi.number().min(0),
  locationText:        Joi.string().trim().max(200).allow(""),
  latitude:            Joi.number().min(-90).max(90),
  longitude:           Joi.number().min(-180).max(180),
}).min(1);

module.exports = { createListingSchema, updateListingSchema };