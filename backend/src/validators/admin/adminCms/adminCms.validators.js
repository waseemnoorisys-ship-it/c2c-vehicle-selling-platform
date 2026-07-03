const Joi = require("joi");

const createCmsPageSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .required(),
  content: Joi.string().min(1).required(),
  isActive: Joi.boolean().default(true),
});

const updateCmsPageSchema = Joi.object({
  slug: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().min(2).max(200).optional(),
  content: Joi.string().min(1).optional(),
  isActive: Joi.boolean().optional(),
});

const slugSchema = Joi.object({
  slug: Joi.string().required(),
});

const cmsIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const listCmsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createCmsPageSchema,
  updateCmsPageSchema,
  slugSchema,
  cmsIdSchema,
  listCmsSchema,
};