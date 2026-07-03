const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const cmsService = require("../../../services/cms/cms.service");
const { createAuditLog } = require("../../../utils/auditLogger");
const {
  createCmsPageSchema,
  updateCmsPageSchema,
  cmsIdSchema,
  listCmsSchema,
} = require("../../../validators/admin/adminCms/adminCms.validators");

const createPage = async (req, res, next) => {
  try {
    const { error, value } = createCmsPageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const existing = await cmsService.findPageBySlug(value.slug);
    if (existing) throw new ApiError(409, "A page with this slug already exists");

    const page = await cmsService.createPage(value);

    await createAuditLog({
      adminId: req.admin._id,
      action: "CREATE_CMS_PAGE",
      resource: "CmsPage",
      resourceId: page._id,
      meta: { slug: page.slug, title: page.title },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { page }, "CMS page created"));
  } catch (err) {
    next(err);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const { error, value } = updateCmsPageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { slug, ...updates } = value;

    const page = await cmsService.findPageBySlug(slug);
    if (!page) throw new ApiError(404, "CMS page not found");

    const updated = await cmsService.updatePageById(page._id, updates);

    await createAuditLog({
      adminId: req.admin._id,
      action: "UPDATE_CMS_PAGE",
      resource: "CmsPage",
      resourceId: page._id,
      meta: { slug, updates },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { page: updated }, "CMS page updated"));
  } catch (err) {
    next(err);
  }
};

const listPages = async (req, res, next) => {
  try {
    const { error, value } = listCmsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit } = value;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null };

    const [pages, total] = await Promise.all([
      cmsService.findAllPages(filter, skip, limit),
      cmsService.countPages(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { pages, total, page, limit }, "CMS pages fetched")
    );
  } catch (err) {
    next(err);
  }
};

const getPage = async (req, res, next) => {
  try {
    const { error, value } = cmsIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const page = await cmsService.findPageById(value.id);
    if (!page) throw new ApiError(404, "CMS page not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { page }, "CMS page fetched"));
  } catch (err) {
    next(err);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const { error, value } = cmsIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const page = await cmsService.findPageById(value.id);
    if (!page) throw new ApiError(404, "CMS page not found");
    if (page.deletedAt) throw new ApiError(400, "Page already deleted");

    await cmsService.updatePageById(value.id, { deletedAt: new Date() });

    await createAuditLog({
      adminId: req.admin._id,
      action: "DELETE_CMS_PAGE",
      resource: "CmsPage",
      resourceId: page._id,
      meta: { slug: page.slug },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "CMS page deleted successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = { createPage, updatePage, listPages, getPage, deletePage };