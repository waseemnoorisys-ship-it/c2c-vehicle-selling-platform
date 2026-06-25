const mongoose = require("mongoose");
const listingService = require("../../services/listing/listing.service");
const {
  uploadListingPhotos,
  deleteFileFromCloudinary,
} = require("../../services/upload/upload.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const MAX_PHOTOS = 10;

async function calculatePricing(askingPrice) {
  let config = await listingService.findCommissionConfig();
  if (!config) {
    config = await listingService.createCommissionConfig({ percentage: 5 });
  }

  const commissionPercent = config.percentage;
  const commissionAmount = (askingPrice * commissionPercent) / 100;
  const displayPrice = askingPrice + commissionAmount;

  return { commissionPercent, displayPrice };
}

async function validateMakeModel(makeId, modelId) {
  const make = await listingService.findMakeById(makeId);
  if (!make) throw new ApiError(404, "Selected make not found");

  const model = await listingService.findModelById(modelId);
  if (!model) throw new ApiError(404, "Selected model not found");

  if (model.makeId.toString() !== makeId.toString()) {
    throw new ApiError(400, "Selected model does not belong to the selected make");
  }
}

async function getOwnedListingOrFail(listingId, vendorId) {
  const listing = await listingService.findOne({ _id: listingId, deletedAt: null });
  if (!listing) throw new ApiError(404, "Listing not found");

  if (listing.vendorId.toString() !== vendorId.toString()) {
    throw new ApiError(403, "You do not have permission to modify this listing");
  }
  return listing;
}

const createListing = async (req, res, next) => {
  try {
    const {
      makeId,
      modelId,
      latitude,
      longitude,
      submitForApproval,
      ...rest
    } = req.body;

    await validateMakeModel(makeId, modelId);

    const { commissionPercent, displayPrice } = await calculatePricing(rest.askingPrice);

    const listing = await listingService.create({
      vendorId: req.user._id,
      makeId,
      modelId,
      ...rest,
      commissionPercent,
      displayPrice,
      location: {
        type: "Point",
        coordinates: [longitude || 0, latitude || 0],
      },
      status: submitForApproval ? "pending" : "draft",
    });

    res.status(201).json(new ApiResponse(201, listing, "Listing created"));
  } catch (err) { next(err); }
};

const updateListing = async (req, res, next) => {
  try {
    const { id: listingId, ...updates } = req.body;

    const listing = await getOwnedListingOrFail(listingId, req.user._id);

    const newMakeId = updates.makeId || listing.makeId;
    const newModelId = updates.modelId || listing.modelId;
    if (updates.makeId || updates.modelId) {
      await validateMakeModel(newMakeId, newModelId);
    }

    if (updates.askingPrice !== undefined) {
      const commissionAmount =
        (updates.askingPrice * listing.commissionPercent) / 100;
      updates.displayPrice = updates.askingPrice + commissionAmount;
    }

    if (updates.latitude !== undefined || updates.longitude !== undefined) {
      updates.location = {
        type: "Point",
        coordinates: [
          updates.longitude ?? listing.location.coordinates[0],
          updates.latitude ?? listing.location.coordinates[1],
        ],
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    if (listing.status === "rejected") {
      updates.status = "pending";
      updates.rejectionReason = null;
    }

    Object.assign(listing, updates);
    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, listing, "Listing updated"));
  } catch (err) { next(err); }
};

const deleteListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListingOrFail(req.body.id, req.user._id);
    listing.deletedAt = new Date();
    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, {
      message: "Listing deleted successfully",
    }, "Listing deleted"));
  } catch (err) { next(err); }
};

const submitListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListingOrFail(req.body.id, req.user._id);

    if (listing.status !== "draft") {
      throw new ApiError(
        400,
        `Cannot submit a listing with status "${listing.status}"`
      );
    }

    if (!listing.photos || listing.photos.length === 0) {
      throw new ApiError(
        400,
        "At least 1 photo is required before submitting for approval"
      );
    }

    listing.status = "pending";
    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, listing, "Listing submitted for approval"));
  } catch (err) { next(err); }
};

const addPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No photo files provided");
    }
    if (!req.body.id) {
      throw new ApiError(400, "Listing id is required");
    }

    const listing = await getOwnedListingOrFail(req.body.id, req.user._id);

    const currentCount = listing.photos.length;
    if (currentCount + req.files.length > MAX_PHOTOS) {
      throw new ApiError(
        400,
        `Maximum ${MAX_PHOTOS} photos allowed. You have ${currentCount}, tried to add ${req.files.length}.`
      );
    }

    const uploadResults = await uploadListingPhotos(req.files, req.body.id);

    listing.photos.push(
      ...uploadResults.map((r) => ({ url: r.url, publicId: r.publicId }))
    );

    if (!listing.coverPhoto) {
      listing.coverPhoto = uploadResults[0].url;
    }

    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, listing, "Photos uploaded"));
  } catch (err) { next(err); }
};

const deletePhoto = async (req, res, next) => {
  try {
    const { id, publicId } = req.body;

    const listing = await getOwnedListingOrFail(id, req.user._id);

    const photoIndex = listing.photos.findIndex(
      (p) => p.publicId === publicId
    );
    if (photoIndex === -1) {
      throw new ApiError(404, "Photo not found on this listing");
    }

    const photoToDelete = listing.photos[photoIndex];

    await deleteFileFromCloudinary(photoToDelete.publicId);
    listing.photos.splice(photoIndex, 1);

    if (listing.coverPhoto === photoToDelete.url) {
      listing.coverPhoto = listing.photos.length > 0
        ? listing.photos[0].url
        : null;
    }

    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, listing, "Photo removed"));
  } catch (err) { next(err); }
};

const getMyListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.body;
    const filter = { vendorId: req.user._id, deletedAt: null };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      listingService.findVendorListings(filter, skip, limit),
      listingService.count(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, "Your listings retrieved"));
  } catch (err) { next(err); }
};

const browseListings = async (req, res, next) => {
  try {
    const {
      search,
      makeId,
      modelId,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      condition,
      latitude,
      longitude,
      radius,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.body;

    const skip = (page - 1) * limit;
    const filter = { status: "approved", deletedAt: null };

    const isGeoSearch = latitude !== undefined && longitude !== undefined;

    if (isGeoSearch) {
      const radiusMeters = (parseFloat(radius) || 50) * 1000;
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radiusMeters,
        },
      };
    }

    if (makeId) filter.makeId = new mongoose.Types.ObjectId(makeId);
    if (modelId) filter.modelId = new mongoose.Types.ObjectId(modelId);

    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear);
      if (maxYear) filter.year.$lte = parseInt(maxYear);
    }

    if (minPrice || maxPrice) {
      filter.displayPrice = {};
      if (minPrice) filter.displayPrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.displayPrice.$lte = parseInt(maxPrice);
    }

    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (condition) filter.condition = condition;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const [matchingMakes, matchingModels] = await Promise.all([
        listingService.findMakesByRegex(searchRegex),
        listingService.findModelsByRegex(searchRegex),
      ]);

      const makeIds = matchingMakes.map((m) => m._id);
      const modelIds = matchingModels.map((m) => m._id);

      const searchConditions = [
        { locationText: searchRegex },
        { description: searchRegex },
      ];
      if (makeIds.length) searchConditions.push({ makeId: { $in: makeIds } });
      if (modelIds.length) searchConditions.push({ modelId: { $in: modelIds } });

      filter.$or = searchConditions;
    }

    let sortObj = {};
    if (!isGeoSearch) {
      switch (sort) {
        case "price_asc": sortObj = { displayPrice: 1 }; break;
        case "price_desc": sortObj = { displayPrice: -1 }; break;
        case "oldest": sortObj = { createdAt: 1 }; break;
        case "most_viewed": sortObj = { viewCount: -1 }; break;
        case "newest":
        default: sortObj = { createdAt: -1 }; break;
      }
    }

    let total = -1;
    if (!isGeoSearch) {
      total = await listingService.count(filter);
    }

    const listings = await listingService.findBrowse(
      filter,
      sortObj,
      skip,
      parseInt(limit),
      isGeoSearch
    );

    res.status(200).json(new ApiResponse(200, {
      listings,
      pagination: isGeoSearch
        ? {
            note: "Geo search active — adjust radius to narrow results.",
            returned: listings.length,
          }
        : {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
    }, "Listings retrieved"));
  } catch (err) { next(err); }
};

const getPublicListingById = async (req, res, next) => {
  try {
    const listing = await listingService.findOneAndIncrementView({
      _id: req.body.id,
      status: "approved",
      deletedAt: null,
    });

    if (!listing) throw new ApiError(404, "Listing not found or not available");

    delete listing.commissionPercent;
    delete listing.askingPrice;

    res.status(200).json(new ApiResponse(200, listing, "Listing retrieved"));
  } catch (err) { next(err); }
};

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  submitListing,
  addPhotos,
  deletePhoto,
  getMyListings,
  browseListings,
  getPublicListingById,
};
