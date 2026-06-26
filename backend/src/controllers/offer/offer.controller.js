const offerService        = require("../../services/offer/offer.service");
const notificationService = require("../../services/notification/notification.service");
const Listing             = require("../../models/listing/listing.model");
const ApiResponse         = require("../../utils/ApiResponse");
const ApiError            = require("../../utils/ApiError");

// POST /api/v1/offers/create
// Auth: buyer role
const createOffer = async (req, res, next) => {
  try {
    const { listingId, amount, message } = req.body;
    const buyerId = req.user._id;

    // Business rule 1: listing must exist and be approved
    const listing = await Listing.findOne({
      _id:       listingId,
      status:    "approved",
      deletedAt: null,
    });
    if (!listing) {
      throw new ApiError(404, "Listing not found or not available for offers");
    }

    // Business rule 2: buyer cannot offer on their own listing
    if (listing.vendorId.toString() === buyerId.toString()) {
      throw new ApiError(403, "You cannot make an offer on your own listing");
    }

    // Business rule 3: one pending offer per buyer per listing
    const existing = await offerService.findOne({
      buyerId,
      listingId,
      status:    "pending",
      deletedAt: null,
    });
    if (existing) {
      throw new ApiError(
        409,
        "You already have a pending offer on this listing. Withdraw it before submitting a new one."
      );
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const offer = await offerService.create({
      buyerId,
      listingId,
      vendorId: listing.vendorId,
      amount,
      message,
      expiresAt,
    });

    // Notify vendor: new offer arrived
    await notificationService.create({
      userId: listing.vendorId,
      type:   "offer_received",
      title:  "New Offer Received",
      body:   `You have a new offer of ${(amount / 100).toFixed(2)} on your listing.`,
      data:   { offerId: offer._id, listingId: listing._id },
    });

    res
      .status(201)
      .json(new ApiResponse(201, offer, "Offer submitted successfully"));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/mine
// Auth: buyer role
const getMyOffers = async (req, res, next) => {
  try {
    const buyerId = req.user._id;
    const page    = parseInt(req.body.page)  || 1;
    const limit   = parseInt(req.body.limit) || 20;
    const skip    = (page - 1) * limit;

    // Lazy expiry: update stale pending offers before returning
    await offerService.updateMany(
      {
        buyerId,
        status:    "pending",
        expiresAt: { $lt: new Date() },
        deletedAt: null,
      },
      { status: "expired" }
    );

    const filter = { buyerId, deletedAt: null };

    const [offers, total] = await Promise.all([
      offerService.findWithListingPopulate(filter, skip, limit),
      offerService.count(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        offers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }, "Your offers retrieved")
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/received
// Auth: vendor role
const getReceivedOffers = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const {
      status,
      listingId,
      page  = 1,
      limit = 20,
    } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { vendorId, deletedAt: null };
    if (status)    filter.status    = status;
    if (listingId) filter.listingId = listingId;

    const [offers, total] = await Promise.all([
      offerService.findWithBuyerAndListingPopulate(
        filter,
        skip,
        parseInt(limit)
      ),
      offerService.count(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        offers,
        pagination: {
          total,
          page:       parseInt(page),
          limit:      parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      }, "Received offers retrieved")
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/accept
// Auth: vendor role
const acceptOffer = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const { id }   = req.body;

    // WHY findOne not findOneWithFullPopulate:
    // we need mutable document to call .save() on it.
    // .lean() returns plain object — cannot call .save()
    const offer = await offerService.findOne({
      _id:       id,
      vendorId,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(
        404,
        "Offer not found or you do not have permission"
      );
    }

    if (offer.status !== "pending") {
      throw new ApiError(
        400,
        `Cannot accept an offer with status "${offer.status}"`
      );
    }

    if (offer.expiresAt < new Date()) {
      offer.status = "expired";
      await offerService.save(offer);
      throw new ApiError(400, "This offer has expired and cannot be accepted");
    }

    // Step 1: Accept this offer
    offer.status = "accepted";
    await offerService.save(offer);

    // Step 2: Mark listing as sold
    await offerService.updateListingStatus(offer.listingId, "sold");

    // Step 3: Auto-reject all other pending offers on this listing
    await offerService.updateMany(
      {
        listingId: offer.listingId,
        _id:       { $ne: offer._id },
        status:    "pending",
        deletedAt: null,
      },
      { status: "rejected" }
    );

    // Step 4: Fetch auto-rejected offers to notify their buyers
    const autoRejected = await offerService.findMany({
      listingId: offer.listingId,
      _id:       { $ne: offer._id },
      status:    "rejected",
      deletedAt: null,
    });

    // Step 5: Notify accepted buyer
    await notificationService.create({
      userId: offer.buyerId,
      type:   "offer_accepted",
      title:  "Your Offer Was Accepted!",
      body:   `Congratulations! Your offer of ${(offer.amount / 100).toFixed(2)} was accepted. Proceed to payment.`,
      data:   { offerId: offer._id, listingId: offer.listingId },
    });

    // Step 6: Bulk notify auto-rejected buyers
    if (autoRejected.length > 0) {
      const rejectionNotifications = autoRejected.map((o) => ({
        userId:    o.buyerId,
        type:      "offer_rejected",
        title:     "Offer No Longer Available",
        body:      "The listing you made an offer on has been sold to another buyer.",
        data:      { offerId: o._id, listingId: o.listingId },
        isRead:    false,
        deletedAt: null,
      }));

      await notificationService.insertMany(rejectionNotifications);
    }

    res
      .status(200)
      .json(new ApiResponse(200, offer, "Offer accepted successfully"));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/reject
// Auth: vendor role
const rejectOffer = async (req, res, next) => {
  try {
    const vendorId       = req.user._id;
    const { id, reason } = req.body;

    const offer = await offerService.findOne({
      _id:       id,
      vendorId,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(
        404,
        "Offer not found or you do not have permission"
      );
    }

    if (offer.status !== "pending") {
      throw new ApiError(
        400,
        `Cannot reject an offer with status "${offer.status}"`
      );
    }

    offer.status = "rejected";
    if (reason) offer.rejectionReason = reason;
    await offerService.save(offer);

    await notificationService.create({
      userId: offer.buyerId,
      type:   "offer_rejected",
      title:  "Your Offer Was Declined",
      body:   reason
        ? `Your offer was declined. Reason: ${reason}`
        : "Your offer was declined by the seller.",
      data:   { offerId: offer._id, listingId: offer.listingId },
    });

    res
      .status(200)
      .json(new ApiResponse(200, offer, "Offer rejected successfully"));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/get
// Auth: buyer or vendor
const getOffer = async (req, res, next) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    const offer = await offerService.findOneWithFullPopulate({
      _id:       id,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(404, "Offer not found");
    }

    // Ownership: buyer or vendor party to this offer only
    const isBuyer  = offer.buyerId._id.toString()  === userId.toString();
    const isVendor = offer.vendorId._id.toString() === userId.toString();

    if (!isBuyer && !isVendor) {
      throw new ApiError(
        403,
        "You do not have permission to view this offer"
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, offer, "Offer retrieved"));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOffer,
  getMyOffers,
  getReceivedOffers,
  acceptOffer,
  rejectOffer,
  getOffer,
};