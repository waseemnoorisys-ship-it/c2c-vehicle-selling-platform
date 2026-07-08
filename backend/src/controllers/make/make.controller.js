const makeService = require("../../services/make/make.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

const getAllMakes = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.body;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    const [makes, total] = await Promise.all([
      makeService.findAll(filter, skip, limit),
      makeService.count(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
      makes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (err) { next(err); }
};

const getMakeById = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const make = await makeService.findById(req.body.id);
    if (!make) throw new ApiError(404, t("errors.make.notFound", lang));

    res.status(200).json(new ApiResponse(200, make));
  } catch (err) { next(err); }
};

const createMake = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { name } = req.body;

    const existing = await makeService.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) throw new ApiError(409, t("errors.make.exists", lang));

    const make = await makeService.create({ name });
    res.status(201).json(new ApiResponse(201, make, t("success.make.created", lang)));
  } catch (err) { next(err); }
};

const updateMake = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { id, ...updates } = req.body;
    const make = await makeService.findByIdAndUpdate(id, updates);
    if (!make) throw new ApiError(404, t("errors.make.notFound", lang));

    res.status(200).json(new ApiResponse(200, make, t("success.make.updated", lang)));
  } catch (err) { next(err); }
};

const deleteMake = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const make = await makeService.findByIdAndDelete(req.body.id);
    if (!make) throw new ApiError(404, t("errors.make.notFound", lang));

    res.status(200).json(new ApiResponse(200, null, t("success.make.deleted", lang)));
  } catch (err) { next(err); }
};

module.exports = { getAllMakes, getMakeById, createMake, updateMake, deleteMake };
