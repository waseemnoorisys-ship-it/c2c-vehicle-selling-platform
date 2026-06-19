const VehicleModel = require("../../models/vehicleModel/vehicleModel.model");
const VehicleMake   = require("../../models/vehicleMake/vehicleMake.model");
const ApiError       = require("../../utils/ApiError");

// WHY makeId is optional here: Admin's management screen might want
// to see ALL models across all makes, while the vendor's dropdown
// always passes a specific makeId.
async function getAllModels({ makeId, page = 1, limit = 100 } = {}) {
  const filter = { isActive: true };
  if (makeId) filter.makeId = makeId;

  const skip = (page - 1) * limit;
  const [models, total] = await Promise.all([
    VehicleModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    VehicleModel.countDocuments(filter),
  ]);

  return { models, total, page, totalPages: Math.ceil(total / limit) };
}

async function getModelById(id) {
  const model = await VehicleModel.findById(id);
  if (!model) throw new ApiError(404, "Model not found");
  return model;
}

async function createModel({ makeId, name }) {
  // WHY verify the parent make exists first:
  // Without this check, you could create a Model pointing to a
  // non-existent makeId — an "orphaned" reference that breaks later
  // when trying to populate() and display the make's name.
  const make = await VehicleMake.findById(makeId);
  if (!make) throw new ApiError(404, "Parent make not found");

  const existing = await VehicleModel.findOne({
    makeId,
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (existing) throw new ApiError(409, "This model already exists for this make");

  return VehicleModel.create({ makeId, name });
}

async function updateModel(id, updates) {
  const model = await VehicleModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!model) throw new ApiError(404, "Model not found");
  return model;
}

async function deleteModel(id) {
  const model = await VehicleModel.findByIdAndDelete(id);
  if (!model) throw new ApiError(404, "Model not found");
  return model;
}

module.exports = { getAllModels, getModelById, createModel, updateModel, deleteModel };