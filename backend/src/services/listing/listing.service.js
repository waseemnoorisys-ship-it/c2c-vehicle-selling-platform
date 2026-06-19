const Listing         = require("../../models/listing/listing.model");
const VehicleMake      = require("../../models/vehicleMake/vehicleMake.model");
const VehicleModel     = require("../../models/vehicleModel/vehicleModel.model");
const CommissionConfig = require("../../models/commission/commission.model");
const ApiError          = require("../../utils/ApiError");
const { uploadFileToS3, deleteFileFromS3 } = require("../upload/upload.service");

const MAX_PHOTOS = 10;

// WHY a helper instead of inlining this math everywhere:
// commission calculation will be needed again in Sprint 5 (payments).
// One source of truth prevents the formula drifting out of sync.
async function calculatePricing(askingPrice) {
  // WHY findOne with no filter: this collection is a singleton (see model file).
  // If no config exists yet (fresh install), default to 5%.
  let config = await CommissionConfig.findOne();
  if (!config) {
    config = await CommissionConfig.create({ percentage: 5 });
  }

  const commissionPercent = config.percentage;
  const commissionAmount  = (askingPrice * commissionPercent) / 100;
  const displayPrice      = askingPrice + commissionAmount;

  return { commissionPercent, displayPrice };
}

// WHY verify make/model exist + model belongs to that make:
// prevents a buggy frontend (or malicious request) from creating
// a listing with mismatched/invalid references.
async function validateMakeModel(makeId, modelId) {
  const make = await VehicleMake.findById(makeId);
  if (!make) throw new ApiError(404, "Selected make not found");

  const model = await VehicleModel.findById(modelId);
  if (!model) throw new ApiError(404, "Selected model not found");

  if (model.makeId.toString() !== makeId.toString()) {
    throw new ApiError(400, "Selected model does not belong to the selected make");
  }
}

async function createListing(vendorId, data) {
  const { makeId, modelId, latitude, longitude, submitForApproval, ...rest } = data;

  await validateMakeModel(makeId, modelId);

  const { commissionPercent, displayPrice } = await calculatePricing(data.askingPrice);

  const listing = await Listing.create({
    vendorId,
    makeId,
    modelId,
    ...rest,
    commissionPercent,
    displayPrice,
    // WHY default [0,0] if no coordinates given: MongoDB's geo index
    // requires SOME coordinate value to exist; we treat [0,0] as
    // "location not set yet" and can prompt the vendor to add it later.
    location: {
      type: "Point",
      coordinates: [longitude || 0, latitude || 0],
    },
    // WHY status decided here, not trusted from client directly:
    // client sends a boolean intent ("I want to submit"), and WE decide
    // the actual status string — keeps status values consistent and safe.
    status: submitForApproval ? "pending" : "draft",
  });

  return listing;
}

// WHY this is a separate exported function (not just inline in controller):
// both updateListing() and submitListing() need to verify ownership —
// a single reusable function avoids repeating this critical security check.
async function getOwnedListingOrFail(listingId, vendorId) {
  const listing = await Listing.findOne({ _id: listingId, deletedAt: null });
  if (!listing) throw new ApiError(404, "Listing not found");

  if (listing.vendorId.toString() !== vendorId.toString()) {
    throw new ApiError(403, "You do not have permission to modify this listing");
  }
  return listing;
}

async function updateListing(listingId, vendorId, updates) {
  const listing = await getOwnedListingOrFail(listingId, vendorId);

  // If make or model is being changed, re-validate the pairing
  const newMakeId  = updates.makeId  || listing.makeId;
  const newModelId = updates.modelId || listing.modelId;
  if (updates.makeId || updates.modelId) {
    await validateMakeModel(newMakeId, newModelId);
  }

  // If price changes, recalculate displayPrice using CURRENT commission
  // rate? Or keep the original snapshot? Business decision (see Project
  // Bible): we keep the ORIGINAL commissionPercent snapshot, only
  // recompute displayPrice using that same original percent.
  if (updates.askingPrice !== undefined) {
    const commissionAmount = (updates.askingPrice * listing.commissionPercent) / 100;
    updates.displayPrice = updates.askingPrice + commissionAmount;
  }

  // Handle optional lat/lng update
  if (updates.latitude !== undefined || updates.longitude !== undefined) {
    updates.location = {
      type: "Point",
      coordinates: [
        updates.longitude ?? listing.location.coordinates[0],
        updates.latitude  ?? listing.location.coordinates[1],
      ],
    };
  }

  // WHY reset rejected → pending on edit:
  // if admin rejected a listing for a fixable reason, and vendor just
  // edited it, it makes sense to put it back in the review queue
  // automatically rather than making the vendor manually resubmit.
  if (listing.status === "rejected") {
    updates.status = "pending";
    updates.rejectionReason = null;
  }

  Object.assign(listing, updates);
  await listing.save();
  return listing;
}

async function deleteListing(listingId, vendorId) {
  const listing = await getOwnedListingOrFail(listingId, vendorId);
  listing.deletedAt = new Date(); // soft delete — see Sprint 2 explanation
  await listing.save();
  return { message: "Listing deleted successfully" };
}

async function submitListing(listingId, vendorId) {
  const listing = await getOwnedListingOrFail(listingId, vendorId);

  if (listing.status !== "draft") {
    throw new ApiError(400, `Cannot submit a listing with status "${listing.status}"`);
  }

  // WHY minimum requirements check before allowing submission:
  // a draft can be incomplete, but a listing entering the admin review
  // queue should at least have a photo — otherwise admin can't evaluate it.
  if (!listing.photos || listing.photos.length === 0) {
    throw new ApiError(400, "At least 1 photo is required before submitting for approval");
  }

  listing.status = "pending";
  await listing.save();
  return listing;
}

async function addPhotos(listingId, vendorId, files) {
  const listing = await getOwnedListingOrFail(listingId, vendorId);

  const currentCount = listing.photos.length;
  if (currentCount + files.length > MAX_PHOTOS) {
    throw new ApiError(
      400,
      `Maximum ${MAX_PHOTOS} photos allowed. You have ${currentCount}, tried to add ${files.length}.`
    );
  }

  // WHY Promise.all instead of a for-loop with await inside:
  // uploads multiple files to S3 in PARALLEL rather than one-by-one,
  // significantly faster for the user when uploading 5-10 photos at once.
  const uploadPromises = files.map((file) =>
    uploadFileToS3(file.buffer, file.originalname, file.mimetype, `listings/${listingId}`)
  );
  const newUrls = await Promise.all(uploadPromises);

  listing.photos.push(...newUrls);

  // WHY auto-set cover photo: if this is the vendor's first upload,
  // automatically make the first photo the cover — avoids an empty
  // thumbnail on the listing card if they forget to manually pick one.
  if (!listing.coverPhoto) {
    listing.coverPhoto = newUrls[0];
  }

  await listing.save();
  return listing;
}

async function deletePhoto(listingId, vendorId, photoUrl) {
  const listing = await getOwnedListingOrFail(listingId, vendorId);

  const photoExists = listing.photos.includes(photoUrl);
  if (!photoExists) throw new ApiError(404, "Photo not found on this listing");

  listing.photos = listing.photos.filter((p) => p !== photoUrl);
  await deleteFileFromS3(photoUrl); // remove from cloud storage too

  // WHY re-assign cover if it was the deleted one:
  // avoids the listing card showing a broken image link.
  if (listing.coverPhoto === photoUrl) {
    listing.coverPhoto = listing.photos[0] || null;
  }

  await listing.save();
  return listing;
}

async function getMyListings(vendorId, { status, page = 1, limit = 20 } = {}) {
  const filter = { vendorId, deletedAt: null };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  // WHY .populate(): replaces makeId/modelId ObjectId references with
  // the actual Make/Model documents (name etc) — see Project Bible
  // explanation on referencing vs embedding. This is the "join" step.
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate("makeId", "name")
      .populate("modelId", "name")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  return { listings, total, page, totalPages: Math.ceil(total / limit) };
}

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  submitListing,
  addPhotos,
  deletePhoto,
  getMyListings,
  getOwnedListingOrFail,
};