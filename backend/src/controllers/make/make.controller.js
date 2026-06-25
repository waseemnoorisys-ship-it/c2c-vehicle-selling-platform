const makeService = require("../../services/make/make.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

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
    const make = await makeService.findById(req.body.id);
    if (!make) throw new ApiError(404, "Make not found");

    res.status(200).json(new ApiResponse(200, make));
  } catch (err) { next(err); }
};

const createMake = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existing = await makeService.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) throw new ApiError(409, "This make already exists");

    const make = await makeService.create({ name });
    res.status(201).json(new ApiResponse(201, make, "Make created"));
  } catch (err) { next(err); }
};

const updateMake = async (req, res, next) => {
  try {
    const { id, ...updates } = req.body;
    const make = await makeService.findByIdAndUpdate(id, updates);
    if (!make) throw new ApiError(404, "Make not found");

    res.status(200).json(new ApiResponse(200, make, "Make updated"));
  } catch (err) { next(err); }
};

const deleteMake = async (req, res, next) => {
  try {
    const make = await makeService.findByIdAndDelete(req.body.id);
    if (!make) throw new ApiError(404, "Make not found");

    res.status(200).json(new ApiResponse(200, null, "Make deleted"));
  } catch (err) { next(err); }
};

module.exports = { getAllMakes, getMakeById, createMake, updateMake, deleteMake };
