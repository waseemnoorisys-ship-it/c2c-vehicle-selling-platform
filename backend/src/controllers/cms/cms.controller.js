const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const cmsService = require("../../services/cms/cms.service");
const Joi = require("joi");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

const getPublicPageSchema = Joi.object({
  slug: Joi.string().required(),
});

const getPublicPage = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = getPublicPageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const page = await cmsService.findPageBySlug(value.slug);
    if (!page || !page.isActive) throw new ApiError(404, t("errors.cms.notFound", lang));

    return res
      .status(200)
      .json(new ApiResponse(200, { page }, t("success.cms.fetched", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicPage };
