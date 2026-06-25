const Offer = require("../../models/offer/offer.model");

async function updateMany(filter, update) {
  return Offer.updateMany(filter, update);
}

async function findOne(filter) {
  return Offer.findOne(filter);
}

async function create(data) {
  return Offer.create(data);
}

async function findWithListingPopulate(filter, skip, limit) {
  return Offer.find(filter)
    .populate({
      path: "listingId",
      select: "coverPhoto displayPrice locationText year status",
      populate: [
        { path: "makeId", select: "name" },
        { path: "modelId", select: "name" },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function count(filter) {
  return Offer.countDocuments(filter);
}

module.exports = {
  updateMany,
  findOne,
  create,
  findWithListingPopulate,
  count,
};
