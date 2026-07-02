const Listing = require("../../../models/listing/listing.model");

async function findAllListings(filter, skip, limit) {
  return Listing.find(filter)
    .populate("vendorId", "firstName lastName email")
    .populate("makeId", "name")
    .populate("modelId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countListings(filter) {
  return Listing.countDocuments(filter);
}

async function findListingById(id) {
  return Listing.findOne({ _id: id, deletedAt: null })
    .populate("vendorId", "firstName lastName email")
    .populate("makeId", "name")
    .populate("modelId", "name");
}

async function updateListingById(id, update) {
  return Listing.findByIdAndUpdate(id, update, { new: true });
}

module.exports = {
  findAllListings,
  countListings,
  findListingById,
  updateListingById,
};