const VehicleMake = require("../../models/vehicleMake/vehicleMake.model");

async function findAll(filter, skip, limit) {
  return VehicleMake.find(filter).sort({ name: 1 }).skip(skip).limit(limit);
}

async function count(filter) {
  return VehicleMake.countDocuments(filter);
}

async function findById(id) {
  return VehicleMake.findById(id);
}

async function findOne(filter) {
  return VehicleMake.findOne(filter);
}

async function create(data) {
  return VehicleMake.create(data);
}

async function findByIdAndUpdate(id, updates) {
  return VehicleMake.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

async function findByIdAndDelete(id) {
  return VehicleMake.findByIdAndDelete(id);
}

module.exports = {
  findAll,
  count,
  findById,
  findOne,
  create,
  findByIdAndUpdate,
  findByIdAndDelete,
};
