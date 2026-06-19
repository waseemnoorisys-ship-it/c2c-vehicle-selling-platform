const modelService = require("../../services/model/model.service");
const ApiResponse   = require("../../utils/ApiResponse");

const getAllModels = async (req, res, next) => {
  try {
    const result = await modelService.getAllModels(req.query);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const getModelById = async (req, res, next) => {
  try {
    const model = await modelService.getModelById(req.params.id);
    res.status(200).json(new ApiResponse(200, model));
  } catch (err) { next(err); }
};

const createModel = async (req, res, next) => {
  try {
    const model = await modelService.createModel(req.body);
    res.status(201).json(new ApiResponse(201, model, "Model created"));
  } catch (err) { next(err); }
};

const updateModel = async (req, res, next) => {
  try {
    const model = await modelService.updateModel(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, model, "Model updated"));
  } catch (err) { next(err); }
};

const deleteModel = async (req, res, next) => {
  try {
    await modelService.deleteModel(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Model deleted"));
  } catch (err) { next(err); }
};

module.exports = { getAllModels, getModelById, createModel, updateModel, deleteModel };