const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminListingService = require("../../../services/admin/adminListing/adminListing.service");
const notificationService = require("../../../services/notification/notification.service");
const {
  listListingsSchema,
  listingIdSchema,
  rejectListingSchema,
} = require("../../../validators/admin/adminListing/adminListing.validators");

const listListings = async (req, res, next) => {
  try {
    const { error, value } = listListingsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, status } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;

    const [listings, total] = await Promise.all([
      adminListingService.findAllListings(filter, skip, limit),
      adminListingService.countListings(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { listings, total, page, limit }, "Listings fetched")
    );
  } catch (err) {
    next(err);
  }
};

const getListing = async (req, res, next) => {
  try {
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { listing }, "Listing fetched"));
  } catch (err) {
    next(err);
  }
};

const approveListing = async (req, res, next) => {
  try {
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");

    if (listing.status !== "pending") {
      throw new ApiError(400, "Only pending listings can be approved");
    }

    await adminListingService.updateListingById(value.listingId, {
      status: "approved",
      rejectionReason: null,
    });

    await notificationService.create({
      userId: listing.vendorId._id,
      type: "listing_approved",
      title: "Listing approved",
      body: "Your vehicle listing has been approved and is now live.",
      data: { listingId: listing._id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Listing approved successfully"));
  } catch (err) {
    next(err);
  }
};

const rejectListing = async (req, res, next) => {
  try {
    const { error, value } = rejectListingSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { listingId, rejectionReason } = value;

    const listing = await adminListingService.findListingById(listingId);
    if (!listing) throw new ApiError(404, "Listing not found");

    if (listing.status !== "pending") {
      throw new ApiError(400, "Only pending listings can be rejected");
    }

    await adminListingService.updateListingById(listingId, {
      status: "rejected",
      rejectionReason,
    });

    await notificationService.create({
      userId: listing.vendorId._id,
      type: "listing_rejected",
      title: "Listing rejected",
      body: `Your listing was rejected. Reason: ${rejectionReason}`,
      data: { listingId: listing._id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Listing rejected successfully"));
  } catch (err) {
    next(err);
  }
};

const toggleVerified = async (req, res, next) => {
  try {
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");

    await adminListingService.updateListingById(value.listingId, {
      isVerified: !listing.isVerified,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { isVerified: !listing.isVerified },
        `Listing ${!listing.isVerified ? "verified" : "unverified"} successfully`
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listListings,
  getListing,
  approveListing,
  rejectListing,
  toggleVerified,
};