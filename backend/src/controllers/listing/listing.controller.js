const mongoose = require("mongoose");
const listingService = require("../../services/listing/listing.service");
const {
  uploadListingPhotos,
  deleteFileFromCloudinary,
} = require("../../services/upload/upload.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

const MAX_PHOTOS = 10;

async function calculatePricing(askingPrice) {
  let config = await listingService.findCommissionConfig();
  if (!config) {
    config = await listingService.createCommissionConfig({ percentage: 5 });
  }

  const commissionPercent = config.percentage;
  const commissionAmount = Math.round((askingPrice * commissionPercent) / 100);
  const displayPrice = askingPrice + commissionAmount;

  return { commissionPercent, displayPrice };
}

async function validateMakeModel(makeId, modelId, lang) {
  const make = await listingService.findMakeById(makeId);
  if (!make) throw new ApiError(404, t("errors.listing.makeNotFound", lang));

  const model = await listingService.findModelById(modelId);
  if (!model) throw new ApiError(404, t("errors.listing.modelNotFound", lang));

  if (model.makeId.toString() !== makeId.toString()) {
    throw new ApiError(400, t("errors.listing.modelMismatch", lang));
  }
}

async function getOwnedListingOrFail(listingId, vendorId, lang) {
  const listing = await listingService.findOne({ _id: listingId, deletedAt: null });
  if (!listing) throw new ApiError(404, t("errors.listing.notFound", lang));

  if (listing.vendorId.toString() !== vendorId.toString()) {
    throw new ApiError(403, t("errors.listing.noPermission", lang));
  }
  return listing;
}

const createListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const {
      makeId,
      modelId,
      latitude,
      longitude,
      submitForApproval,
      ...rest
    } = req.body;

    await validateMakeModel(makeId, modelId, lang);

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

    res.status(201).json(new ApiResponse(201, listing, t("success.listing.created", lang)));
  } catch (err) { next(err); }
};

const createListingWithPhotos = async (req, res, next) => {
  try {
    const lang = getLang(req);
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, t("errors.listing.photoRequired", lang));
    }
    if (req.files.length > MAX_PHOTOS) {
      throw new ApiError(400, t("errors.listing.maxPhotos", lang, { max: MAX_PHOTOS }));
    }

    const {
      makeId,
      modelId,
      latitude,
      longitude,
      submitForApproval,
      ...rest
    } = req.body;

    await validateMakeModel(makeId, modelId, lang);

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
      photos: [],
      coverPhoto: null,
    });

    const uploadResults = await uploadListingPhotos(
      req.files,
      listing._id.toString()
    );

    listing.photos = uploadResults.map((r) => ({
      url: r.url,
      publicId: r.publicId,
    }));
    listing.coverPhoto = uploadResults[0].url;

    await listingService.save(listing);

    res
      .status(201)
      .json(new ApiResponse(201, listing, t("success.listing.createdWithPhotos", lang)));
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { id: listingId, ...updates } = req.body;

    const listing = await getOwnedListingOrFail(listingId, req.user._id, lang);

    const newMakeId = updates.makeId || listing.makeId;
    const newModelId = updates.modelId || listing.modelId;
    if (updates.makeId || updates.modelId) {
      await validateMakeModel(newMakeId, newModelId, lang);
    }

    if (updates.askingPrice !== undefined) {
      const commissionAmount = Math.round(
        (updates.askingPrice * listing.commissionPercent) / 100
      );
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

    res.status(200).json(new ApiResponse(200, listing, t("success.listing.updated", lang)));
  } catch (err) { next(err); }
};

const deleteListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const listing = await getOwnedListingOrFail(req.body.id, req.user._id, lang);
    listing.deletedAt = new Date();
    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, {
      message: "Listing deleted successfully",
    }, t("success.listing.deleted", lang)));
  } catch (err) { next(err); }
};

const submitListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const listing = await getOwnedListingOrFail(req.body.id, req.user._id, lang);

    if (listing.status !== "draft") {
      throw new ApiError(
        400,
        t("errors.listing.cannotSubmitStatus", lang, { status: listing.status })
      );
    }

    if (!listing.photos || listing.photos.length === 0) {
      throw new ApiError(400, t("errors.listing.photoRequired", lang));
    }

    listing.status = "pending";
    await listingService.save(listing);

    res.status(200).json(new ApiResponse(200, listing, t("success.listing.submitted", lang)));
  } catch (err) { next(err); }
};

const addPhotos = async (req, res, next) => {
  try {
    const lang = getLang(req);
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, t("errors.listing.noPhotoFiles", lang));
    }
    if (!req.body.id) {
      throw new ApiError(400, t("errors.listing.listingIdRequired", lang));
    }

    const listing = await getOwnedListingOrFail(req.body.id, req.user._id, lang);

    const currentCount = listing.photos.length;
    if (currentCount + req.files.length > MAX_PHOTOS) {
      throw new ApiError(
        400,
        t("errors.listing.maxPhotos", lang, { max: MAX_PHOTOS })
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

    res.status(200).json(new ApiResponse(200, listing, t("success.listing.photosUploaded", lang)));
  } catch (err) { next(err); }
};

const deletePhoto = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { id, publicId } = req.body;

    const listing = await getOwnedListingOrFail(id, req.user._id, lang);

    const photoIndex = listing.photos.findIndex(
      (p) => p.publicId === publicId
    );
    if (photoIndex === -1) {
      throw new ApiError(404, t("errors.listing.photoNotFound", lang));
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

    res.status(200).json(new ApiResponse(200, listing, t("success.listing.photoRemoved", lang)));
  } catch (err) { next(err); }
};

const getMyListings = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
    }, t("success.listing.mineRetrieved", lang)));
  } catch (err) { next(err); }
};

const browseListings = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
      dateFrom,
      dateTo,
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

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setUTCHours(0, 0, 0, 0);
        filter.createdAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
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
    }, t("success.listing.browseRetrieved", lang)));
  } catch (err) { next(err); }
};

const getPublicListingById = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const listing = await listingService.findOneAndIncrementView({
      _id: req.body.id,
      status: "approved",
      deletedAt: null,
    });

    if (!listing) throw new ApiError(404, t("errors.listing.notAvailable", lang));

    delete listing.commissionPercent;
    delete listing.askingPrice;

    res.status(200).json(new ApiResponse(200, listing, t("success.listing.retrieved", lang)));
  } catch (err) { next(err); }
};

module.exports = {
  createListing,
  createListingWithPhotos,
  updateListing,
  deleteListing,
  submitListing,
  addPhotos,
  deletePhoto,
  getMyListings,
  browseListings,
  getPublicListingById,
};
