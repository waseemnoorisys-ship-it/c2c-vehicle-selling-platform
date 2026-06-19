const VehicleMake = require("../../models/vehicleMake/vehicleMake.model");
const ApiError     = require("../../utils/ApiError");

async function getAllMakes({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;

  // WHY .find({isActive: true}) by default: soft-disabled makes
  // (admin turned them off) shouldn't appear in public dropdowns.
  const [makes, total] = await Promise.all([
    VehicleMake.find({ isActive: true }).sort({ name: 1 }).skip(skip).limit(limit),
    VehicleMake.countDocuments({ isActive: true }),
  ]);

  return { makes, total, page, totalPages: Math.ceil(total / limit) };
}

async function getMakeById(id) {
  const make = await VehicleMake.findById(id);
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}

async function createMake({ name }) {
  // WHY case-insensitive duplicate check:
  // Without this, "Toyota" and "toyota" would both be allowed in MongoDB
  // (the unique index is case-SENSITIVE by default), creating confusing duplicates.
  const existing = await VehicleMake.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (existing) throw new ApiError(409, "This make already exists");

  return VehicleMake.create({ name });
}

async function updateMake(id, updates) {
  const make = await VehicleMake.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}

async function deleteMake(id) {
  // WHY hard delete is OK here (unlike listings):
  // Makes/Models are reference data, not user-generated transactional data.
  // But in production you'd first check no listings reference this make
  // before allowing deletion — left as an enhancement.
  const make = await VehicleMake.findByIdAndDelete(id);
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}

module.exports = { getAllMakes, getMakeById, createMake, updateMake, deleteMake };