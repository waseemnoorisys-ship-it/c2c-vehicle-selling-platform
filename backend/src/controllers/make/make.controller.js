const makeService = require("../../services/make/make.service");
const ApiResponse  = require("../../utils/ApiResponse");

const getAllMakes = async (req, res, next) => {
  try {
    const result = await makeService.getAllMakes(req.query);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

const getMakeById = async (req, res, next) => {
  try {
    const make = await makeService.getMakeById(req.params.id);
    res.status(200).json(new ApiResponse(200, make));
  } catch (err) { next(err); }
};

const createMake = async (req, res, next) => {
  try {
    const make = await makeService.createMake(req.body);
    res.status(201).json(new ApiResponse(201, make, "Make created"));
  } catch (err) { next(err); }
};

const updateMake = async (req, res, next) => {
  try {
    const make = await makeService.updateMake(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, make, "Make updated"));
  } catch (err) { next(err); }
};

const deleteMake = async (req, res, next) => {
  try {
    await makeService.deleteMake(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Make deleted"));
  } catch (err) { next(err); }
};

module.exports = { getAllMakes, getMakeById, createMake, updateMake, deleteMake };