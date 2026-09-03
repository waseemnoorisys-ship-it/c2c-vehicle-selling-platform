const offerService = require("../../services/offer/offer.service");
//old notification service
const notificationService = require("../../services/notification/notification.service");
//new version of notification service
const { sendPushNotification } = require("../../services/push/push.service");
const { sendEmail } = require("../../services/email/email.service");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");
const userService = require("../../services/user/user.service");
const Listing = require("../../models/listing/listing.model");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const logger = require("../../config/logger");

// POST /api/v1/offers/create
// Auth: buyer role
const createOffer = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { listingId, amount, message } = req.body;
    const buyerId = req.user._id;

    // Business rule 1: listing must exist and be approved
    const listing = await Listing.findOne({
      _id: listingId,
      status: "approved",
      deletedAt: null,
    });
    if (!listing) {
      throw new ApiError(404, t("errors.offer.listingUnavailable", lang));
    }

    // Business rule 2: buyer cannot offer on their own listing
    if (listing.vendorId.toString() === buyerId.toString()) {
      throw new ApiError(403, t("errors.offer.ownListing", lang));
    }

    // Business rule 3: one pending offer per buyer per listing
    const existing = await offerService.findOne({
      buyerId,
      listingId,
      status: "pending",
      deletedAt: null,
    });
    if (existing) {
      throw new ApiError(409, t("errors.offer.alreadyPending", lang));
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
    // Notify vendor: in-app + push + email (non-blocking)
    await notificationService.create({
      userId: listing.vendorId,
      type: "offer_received",
      title: "New Offer Received",
      body: `You have a new offer of €${(amount / 100).toFixed(2)} on your listing.`,
      data: { offerId: offer._id, listingId: listing._id },
    });

    try {
      const vendor = await userService.findById(offer.vendorId);
      if (!vendor) throw new Error("Vendor not found");

      const notifyLang = vendor.language || "en";
      const formattedAmount = `€${(offer.amount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: vendor.fcmToken,
        title: t("offer.received.title", notifyLang),
        body: t("offer.received.body", notifyLang, { amount: formattedAmount }),
        data: {
          offerId: offer._id.toString(),
          listingId: listing._id.toString(),
        },
      });

      await sendEmail({
        to: vendor.email,
        templateName: "offerReceived",
        data: {
          firstName: vendor.firstName,
          amount: formattedAmount,
          lang: notifyLang,
        },
      });
    } catch (err) {
      logger.error("Offer received notification failed", err);
    }

    res
      .status(201)
      .json(new ApiResponse(201, offer, t("success.offer.created", lang)));
  } catch (err) {
    next(err);
    logger.error("Offer received notification failed", err);
  }
};

// POST /api/v1/offers/mine
// Auth: buyer role
const getMyOffers = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const buyerId = req.user._id;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 20;
    const skip = (page - 1) * limit;

    // Lazy expiry: update stale pending offers before returning
    await offerService.updateMany(
      {
        buyerId,
        status: "pending",
        expiresAt: { $lt: new Date() },
        deletedAt: null,
      },
      { status: "expired" },
    );

    const filter = { buyerId, deletedAt: null };

    const [offers, total] = await Promise.all([
      offerService.findWithListingPopulate(filter, skip, limit),
      offerService.count(filter),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          offers,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        t("success.offer.mineRetrieved", lang),
      ),
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/received
// Auth: vendor role
const getReceivedOffers = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const vendorId = req.user._id;
    const { status, listingId, page = 1, limit = 20 } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { vendorId, deletedAt: null };
    if (status) filter.status = status;
    if (listingId) filter.listingId = listingId;

    const [offers, total] = await Promise.all([
      offerService.findWithBuyerAndListingPopulate(
        filter,
        skip,
        parseInt(limit),
      ),
      offerService.count(filter),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          offers,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        t("success.offer.receivedRetrieved", lang),
      ),
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/accept
// Auth: vendor role
const acceptOffer = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const vendorId = req.user._id;
    const { id, message } = req.body;

    // WHY findOne not findOneWithFullPopulate:
    // we need mutable document to call .save() on it.
    // .lean() returns plain object — cannot call .save()
    const offer = await offerService.findOne({
      _id: id,
      vendorId,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(404, t("errors.offer.notFound", lang));
    }

    if (offer.status !== "pending") {
      throw new ApiError(
        400,
        t("errors.offer.cannotAcceptStatus", lang, { status: offer.status }),
      );
    }

    if (offer.expiresAt < new Date()) {
      offer.status = "expired";
      await offerService.save(offer);
      throw new ApiError(400, t("errors.offerExtra.expired", lang));
    }

    // Step 1: Accept this offer
    offer.status = "accepted";
    if (message) offer.acceptanceMessage = message;
    await offerService.save(offer);

    // Step 2: Mark listing as sold
    await offerService.updateListingStatus(offer.listingId, "sold");

    // Step 3: Auto-reject all other pending offers on this listing
    await offerService.updateMany(
      {
        listingId: offer.listingId,
        _id: { $ne: offer._id },
        status: "pending",
        deletedAt: null,
      },
      { status: "rejected" },
    );

    // Step 4: Fetch auto-rejected offers to notify their buyers
    const autoRejected = await offerService.findMany({
      listingId: offer.listingId,
      _id: { $ne: offer._id },
      status: "rejected",
      deletedAt: null,
    });

    // Step 5: Notify accepted buyer
    const notificationBody = message
      ? `Congratulations! Your offer of €${(offer.amount / 100).toFixed(2)} was accepted. Message from seller: "${message}"`
      : `Congratulations! Your offer of €${(offer.amount / 100).toFixed(2)} was accepted. Proceed to payment.`;

    await notificationService.create({
      userId: offer.buyerId,
      type: "offer_accepted",
      title: "Your Offer Was Accepted!",
      body: notificationBody,
      data: { offerId: offer._id, listingId: offer.listingId },
    });
    try {
      const buyer = await userService.findById(offer.buyerId);
      const notifyLang = buyer.language || "en";
      const formattedAmount = `€${(offer.amount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: buyer.fcmToken,
        title: t("offer.accepted.title", notifyLang),
        body: t("offer.accepted.body", notifyLang, { amount: formattedAmount }),
        data: { offerId: offer._id.toString() },
      });

      await sendEmail({
        to: buyer.email,
        templateName: "offerAccepted",
        data: {
          firstName: buyer.firstName,
          amount: formattedAmount,
          lang: notifyLang,
        },
      });
    } catch (err) {
      logger.error("Offer accepted notification failed", err);
    }

    // Step 6: Bulk notify auto-rejected buyers
    if (autoRejected.length > 0) {
      const rejectionNotifications = autoRejected.map((o) => ({
        userId: o.buyerId,
        type: "offer_rejected",
        title: "Offer No Longer Available",
        body: "The listing you made an offer on has been sold to another buyer.",
        data: { offerId: o._id, listingId: o.listingId },
        isRead: false,
        deletedAt: null,
      }));

      await notificationService.insertMany(rejectionNotifications);
    }

    res
      .status(200)
      .json(new ApiResponse(200, offer, t("success.offer.accepted", lang)));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/reject
// Auth: vendor role
const rejectOffer = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const vendorId = req.user._id;
    const { id, reason } = req.body;

    const offer = await offerService.findOne({
      _id: id,
      vendorId,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(404, t("errors.offer.notFound", lang));
    }

    if (offer.status !== "pending") {
      throw new ApiError(
        400,
        t("errors.offer.cannotRejectStatus", lang, { status: offer.status }),
      );
    }

    offer.status = "rejected";
    if (reason) offer.rejectionReason = reason;
    await offerService.save(offer);

    await notificationService.create({
      userId: offer.buyerId,
      type: "offer_rejected",
      title: "Your Offer Was Declined",
      body: reason
        ? `Your offer was declined. Reason: ${reason}`
        : "Your offer was declined by the seller.",
      data: { offerId: offer._id, listingId: offer.listingId },
    });

    try {
      const buyer = await userService.findById(offer.buyerId);
      const notifyLang = buyer.language || "en";
      const formattedAmount = `€${(offer.amount / 100).toFixed(2)}`;
    
      await sendPushNotification({
        fcmToken: buyer.fcmToken,
        title: t("offer.rejected.title", notifyLang),
        body: t("offer.rejected.body", notifyLang, { amount: formattedAmount }),
        data: { offerId: offer._id.toString() },
      });
    
      await sendEmail({
        to: buyer.email,
        templateName: "offerRejected",
        data: {
          firstName: buyer.firstName,
          amount: formattedAmount,
          lang: notifyLang,
        },
      });
    } catch (err) {
      logger.error("Offer rejected notification failed", err);
    }

    res
      .status(200)
      .json(new ApiResponse(200, offer, t("success.offer.rejected", lang)));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/get
// Auth: buyer or vendor
const getOffer = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { id } = req.body;
    const userId = req.user._id;

    const offer = await offerService.findOneWithFullPopulate({
      _id: id,
      deletedAt: null,
    });

    if (!offer) {
      throw new ApiError(404, t("errors.offer.notFound", lang));
    }

    // Ownership: buyer or vendor party to this offer only
    const isBuyer = offer.buyerId._id.toString() === userId.toString();
    const isVendor = offer.vendorId._id.toString() === userId.toString();

    if (!isBuyer && !isVendor) {
      throw new ApiError(403, t("errors.offerExtra.viewForbidden", lang));
    }

    res.status(200).json(new ApiResponse(200, offer, t("success.offer.retrieved", lang)));
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
