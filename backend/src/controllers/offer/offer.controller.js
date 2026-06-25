const offerService = require("../../services/offer/offer.service");
const listingService = require("../../services/listing/listing.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const OFFER_EXPIRY_HOURS = 48;

async function expireStaleOffers(buyerId) {
  await offerService.updateMany(
    {
      buyerId,
      status: "pending",
      expiresAt: { $lt: new Date() },
      deletedAt: null,
    },
    { status: "expired" }
  );
}

const createOffer = async (req, res, next) => {
  try {
    const { listingId, amount, message } = req.body;
    const buyerId = req.user._id;

    const listing = await listingService.findOne({
      _id: listingId,
      status: "approved",
      deletedAt: null,
    });
    if (!listing) {
      throw new ApiError(404, "Listing not found or not available for offers");
    }

    if (listing.vendorId.toString() === buyerId.toString()) {
      throw new ApiError(403, "You cannot make an offer on your own listing");
    }

    const existingPendingOffer = await offerService.findOne({
      buyerId,
      listingId,
      status: "pending",
      deletedAt: null,
    });
    if (existingPendingOffer) {
      throw new ApiError(
        409,
        "You already have a pending offer on this listing. Withdraw it before submitting a new one."
      );
    }

    const expiresAt = new Date(
      Date.now() + OFFER_EXPIRY_HOURS * 60 * 60 * 1000
    );

    const offer = await offerService.create({
      buyerId,
      listingId,
      vendorId: listing.vendorId,
      amount,
      message,
      expiresAt,
    });

    res.status(201).json(new ApiResponse(201, offer, "Offer submitted successfully"));
  } catch (err) { next(err); }
};

const getMyOffers = async (req, res, next) => {
  try {
    const buyerId = req.user._id;
    const { page = 1, limit = 20 } = req.body;

    await expireStaleOffers(buyerId);

    const skip = (page - 1) * limit;
    const filter = { buyerId, deletedAt: null };

    const [offers, total] = await Promise.all([
      offerService.findWithListingPopulate(filter, skip, parseInt(limit)),
      offerService.count(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
      offers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    }, "Your offers retrieved"));
  } catch (err) { next(err); }
};

module.exports = { createOffer, getMyOffers };
