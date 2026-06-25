const VehicleModel = require("../../models/vehicleModel/vehicleModel.model");

async function findAll(filter, skip, limit) {
  return VehicleModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit);
}

async function count(filter) {
  return VehicleModel.countDocuments(filter);
}

async function findById(id) {
  return VehicleModel.findById(id);
}

async function findOne(filter) {
  return VehicleModel.findOne(filter);
}

async function create(data) {
  return VehicleModel.create(data);
}

async function findByIdAndUpdate(id, updates) {
  return VehicleModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

async function findByIdAndDelete(id) {
  return VehicleModel.findByIdAndDelete(id);
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
