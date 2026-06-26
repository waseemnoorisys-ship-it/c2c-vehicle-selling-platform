const Offer    = require("../../models/offer/offer.model");
const Listing  = require("../../models/listing/listing.model");

async function updateMany(filter, update) {
  return Offer.updateMany(filter, update);
}

async function findOne(filter) {
  return Offer.findOne(filter);
}

async function create(data) {
  return Offer.create(data);
}

async function save(offer) {
  return offer.save();
}

async function count(filter) {
  return Offer.countDocuments(filter);
}

async function findWithListingPopulate(filter, skip, limit) {
  return Offer.find(filter)
    .populate({
      path:     "listingId",
      select:   "coverPhoto displayPrice locationText year status",
      populate: [
        { path: "makeId",  select: "name" },
        { path: "modelId", select: "name" },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findWithBuyerAndListingPopulate(filter, skip, limit) {
  return Offer.find(filter)
    .populate("buyerId", "firstName")
    .populate({
      path:     "listingId",
      select:   "coverPhoto displayPrice locationText year status",
      populate: [
        { path: "makeId",  select: "name" },
        { path: "modelId", select: "name" },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findOneWithFullPopulate(filter) {
  return Offer.findOne(filter)
    .populate("buyerId",  "firstName email")
    .populate("vendorId", "firstName")
    .populate({
      path:     "listingId",
      select:   "coverPhoto displayPrice locationText year status",
      populate: [
        { path: "makeId",  select: "name" },
        { path: "modelId", select: "name" },
      ],
    })
    .lean();
}

async function findMany(filter) {
  return Offer.find(filter).select("buyerId listingId").lean();
}

async function updateListingStatus(listingId, status) {
  return Listing.findByIdAndUpdate(listingId, { status }, { new: true });
}

module.exports = {
  updateMany,
  findOne,
  create,
  save,
  count,
  findWithListingPopulate,
  findWithBuyerAndListingPopulate,
  findOneWithFullPopulate,
  findMany,
  updateListingStatus,
};