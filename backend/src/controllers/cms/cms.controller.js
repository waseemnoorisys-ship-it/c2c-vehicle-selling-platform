const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const cmsService = require("../../services/cms/cms.service");
const Joi = require("joi");

const getPublicPageSchema = Joi.object({
  slug: Joi.string().required(),
});

const getPublicPage = async (req, res, next) => {
  try {
    const { error, value } = getPublicPageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const page = await cmsService.findPageBySlug(value.slug);
    if (!page || !page.isActive) throw new ApiError(404, "Page not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { page }, "Page fetched"));
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicPage };