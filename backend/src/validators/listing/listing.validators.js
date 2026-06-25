const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const fuelTypeEnum = ["petrol", "diesel", "electric", "hybrid", "cng", "lpg"];
const transmissionEnum = ["manual", "automatic", "semi-automatic"];
const conditionEnum = ["new", "used", "certified-pre-owned"];
const listingStatusEnum = ["draft", "pending", "approved", "rejected", "sold", "inactive"];

const listingIdSchema = Joi.object({
  id: objectId.required(),
});

const getListingByIdSchema = listingIdSchema;

const getMyListingsSchema = Joi.object({
  status: Joi.string().valid(...listingStatusEnum),
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(50).default(20),
});

const createListingSchema = Joi.object({
  makeId:             objectId.required(),
  modelId:            objectId.required(),
  year:               Joi.number().integer().min(1950).max(new Date().getFullYear() + 1).required(),
  registrationNumber: Joi.string().trim().allow("").max(30),
  mileage:            Joi.number().min(0).required(),
  fuelType:           Joi.string().valid(...fuelTypeEnum).required(),
  transmission:       Joi.string().valid(...transmissionEnum).required(),
  condition:          Joi.string().valid(...conditionEnum).default("used"),
  askingPrice:        Joi.number().integer().min(1).required(),
  locationText:       Joi.string().trim().max(200).allow(""),
  latitude:           Joi.number().min(-90).max(90),
  longitude:          Joi.number().min(-180).max(180),
  submitForApproval:  Joi.boolean().default(false),
});

const updateListingSchema = Joi.object({
  id:                 objectId.required(),
  makeId:             objectId,
  modelId:            objectId,
  year:               Joi.number().integer().min(1950).max(new Date().getFullYear() + 1),
  registrationNumber: Joi.string().trim().allow("").max(30),
  mileage:            Joi.number().min(0),
  fuelType:           Joi.string().valid(...fuelTypeEnum),
  transmission:       Joi.string().valid(...transmissionEnum),
  condition:          Joi.string().valid(...conditionEnum),
  askingPrice:        Joi.number().integer().min(1),
  locationText:       Joi.string().trim().max(200).allow(""),
  latitude:           Joi.number().min(-90).max(90),
  longitude:          Joi.number().min(-180).max(180),
}).min(2);

const deletePhotoSchema = Joi.object({
  id:       objectId.required(),
  publicId: Joi.string().trim().required(),
});

const browseListingsSchema = Joi.object({
  search:       Joi.string().trim().max(100),
  makeId:       objectId,
  modelId:      objectId,
  minYear:      Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  maxYear:      Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  minPrice:     Joi.number().integer().min(0),
  maxPrice:     Joi.number().integer().min(0),
  fuelType:     Joi.string().valid(...fuelTypeEnum),
  transmission: Joi.string().valid(...transmissionEnum),
  condition:    Joi.string().valid(...conditionEnum),
  latitude:     Joi.number().min(-90).max(90),
  longitude:    Joi.number().min(-180).max(180),
  radius:       Joi.number().min(1).max(500),
  sort:         Joi.string().valid("price_asc", "price_desc", "newest", "oldest", "most_viewed"),
  page:         Joi.number().integer().min(1).default(1),
  limit:        Joi.number().integer().min(1).max(50).default(20),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  browseListingsSchema,
  getListingByIdSchema,
  listingIdSchema,
  deletePhotoSchema,
  getMyListingsSchema,
};
