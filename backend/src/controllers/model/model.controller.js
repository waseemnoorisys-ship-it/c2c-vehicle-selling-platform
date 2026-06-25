const modelService = require("../../services/model/model.service");
const makeService = require("../../services/make/make.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const getAllModels = async (req, res, next) => {
  try {
    const { makeId, page = 1, limit = 100 } = req.body;
    const filter = { isActive: true };
    if (makeId) filter.makeId = makeId;

    const skip = (page - 1) * limit;
    const [models, total] = await Promise.all([
      modelService.findAll(filter, skip, limit),
      modelService.count(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
      models,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (err) { next(err); }
};

const getModelById = async (req, res, next) => {
  try {
    const model = await modelService.findById(req.body.id);
    if (!model) throw new ApiError(404, "Model not found");

    res.status(200).json(new ApiResponse(200, model));
  } catch (err) { next(err); }
};

const createModel = async (req, res, next) => {
  try {
    const { makeId, name } = req.body;

    const make = await makeService.findById(makeId);
    if (!make) throw new ApiError(404, "Parent make not found");

    const existing = await modelService.findOne({
      makeId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) throw new ApiError(409, "This model already exists for this make");

    const model = await modelService.create({ makeId, name });
    res.status(201).json(new ApiResponse(201, model, "Model created"));
  } catch (err) { next(err); }
};

const updateModel = async (req, res, next) => {
  try {
    const { id, ...updates } = req.body;
    const model = await modelService.findByIdAndUpdate(id, updates);
    if (!model) throw new ApiError(404, "Model not found");

    res.status(200).json(new ApiResponse(200, model, "Model updated"));
  } catch (err) { next(err); }
};

const deleteModel = async (req, res, next) => {
  try {
    const model = await modelService.findByIdAndDelete(req.body.id);
    if (!model) throw new ApiError(404, "Model not found");

    res.status(200).json(new ApiResponse(200, null, "Model deleted"));
  } catch (err) { next(err); }
};

module.exports = { getAllModels, getModelById, createModel, updateModel, deleteModel };
