const Listing = require("../../models/listing/listing.model");
const VehicleMake = require("../../models/vehicleMake/vehicleMake.model");
const VehicleModel = require("../../models/vehicleModel/vehicleModel.model");
const CommissionConfig = require("../../models/commission/commission.model");

async function findCommissionConfig() {
  return CommissionConfig.findOne();
}

async function createCommissionConfig(data) {
  return CommissionConfig.create(data);
}

async function findMakeById(id) {
  return VehicleMake.findById(id);
}

async function findModelById(id) {
  return VehicleModel.findById(id);
}

async function findMakesByRegex(regex) {
  return VehicleMake.find({ name: regex }).select("_id").lean();
}

async function findModelsByRegex(regex) {
  return VehicleModel.find({ name: regex }).select("_id").lean();
}

async function create(data) {
  return Listing.create(data);
}

async function findOne(filter) {
  return Listing.findOne(filter);
}

async function save(listing) {
  return listing.save();
}

async function findVendorListings(filter, skip, limit) {
  return Listing.find(filter)
    .populate("makeId", "name")
    .populate("modelId", "name")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function count(filter) {
  return Listing.countDocuments(filter);
}

async function findBrowse(filter, sortObj, skip, limit, isGeoSearch) {
  return Listing.find(filter)
    .populate("makeId", "name")
    .populate("modelId", "name")
    .select("-description -rejectionReason -commissionPercent -askingPrice")
    .sort(sortObj)
    .skip(isGeoSearch ? 0 : skip)
    .limit(limit)
    .lean();
}

async function findOneAndIncrementView(filter) {
  return Listing.findOneAndUpdate(filter, { $inc: { viewCount: 1 } }, { new: true })
    .populate("makeId", "name")
    .populate("modelId", "name")
    .populate("vendorId", "firstName")
    .lean();
}
async function findListingById(id) {
  return Listing.findById(id);
}

async function updateListingById(id, update) {
  return Listing.findByIdAndUpdate(id, update, { new: true });
}

module.exports = {
  findCommissionConfig,
  createCommissionConfig,
  findMakeById,
  findModelById,
  findMakesByRegex,
  findModelsByRegex,
  create,
  findOne,
  save,
  findVendorListings,
  count,
  findBrowse,
  findOneAndIncrementView,
  findListingById,
  updateListingById,
};
