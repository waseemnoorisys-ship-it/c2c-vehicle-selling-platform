const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminListingService = require("../../../services/admin/adminListing/adminListing.service");
const notificationService = require("../../../services/notification/notification.service");
const {
  listListingsSchema,
  listingIdSchema,
  rejectListingSchema,
} = require("../../../validators/admin/adminListing/adminListing.validators");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");
const chatService = require("../../../services/chat/chat.service");

const listListings = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listListingsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, status, dateFrom, dateTo } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;
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
    const [listings, total] = await Promise.all([
      adminListingService.findAllListings(filter, skip, limit, dateFrom, dateTo),
      adminListingService.countListings(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { listings, total, page, limit }, t("success.admin.listingsFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

const getListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, t("errors.listing.notFound", lang));

    return res
      .status(200)
      .json(new ApiResponse(200, { listing }, t("success.admin.listingFetched", lang)));
  } catch (err) {
    next(err);
  }
};

const approveListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, t("errors.listing.notFound", lang));

    if (listing.status !== "pending") {
      throw new ApiError(400, t("errors.listing.onlyPendingApprove", lang));
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
      .json(new ApiResponse(200, {}, t("success.listing.approved", lang)));
  } catch (err) {
    next(err);
  }
};

const rejectListing = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = rejectListingSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { listingId, rejectionReason } = value;

    const listing = await adminListingService.findListingById(listingId);
    if (!listing) throw new ApiError(404, t("errors.listing.notFound", lang));

    if (listing.status !== "pending") {
      throw new ApiError(400, t("errors.listing.onlyPendingReject", lang));
    }

    await adminListingService.updateListingById(listingId, {
      status: "rejected",
      rejectionReason,
    });

    //new sprint10chat-B for if listings reject so also reject the conversation should be closed
    try {
      await chatService.closeConversationsByListingId(listingId);
    } catch (err) {
      logger.error("Auto-close conversations on reject failed", err);
    }

    await notificationService.create({
      userId: listing.vendorId._id,
      type: "listing_rejected",
      title: "Listing rejected",
      body: `Your listing was rejected. Reason: ${rejectionReason}`,
      data: { listingId: listing._id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, t("success.listing.rejected", lang)));
  } catch (err) {
    next(err);
  }
};

const toggleVerified = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listingIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const listing = await adminListingService.findListingById(value.listingId);
    if (!listing) throw new ApiError(404, t("errors.listing.notFound", lang));

    await adminListingService.updateListingById(value.listingId, {
      isVerified: !listing.isVerified,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { isVerified: !listing.isVerified },
        t("success.listing.verifiedToggled", lang, { state: !listing.isVerified ? "verified" : "unverified" })
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
