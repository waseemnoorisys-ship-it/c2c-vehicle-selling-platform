const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const { validate } = require("../../middleware/validate.middleware");
const {
  createIntentSchema,
  confirmDeliverySchema,
  getTransactionSchema,
} = require("../../validators/payment/payment.validators");
const offerService = require("../../services/offer/offer.service");
const listingService = require("../../services/listing/listing.service");
const paymentService = require("../../services/payment/payment.service");
const walletService = require("../../services/wallet/wallet.service");
const notificationService = require("../../services/notification/notification.service");
const logger = require("../../config/logger");
//sprint - 6 requirements 
const invoiceService = require("../../services/invoice/invoice.service");
//iss ka kaam hai sirf  bill banana/ready karna  like petroll pump bill/paper  
const createPaymentIntent = async (req, res, next) => {
  try {
    const { error, value } = createIntentSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { offerId } = value;
    const buyerId = req.user._id;

    const offer = await offerService.findOfferById(offerId);
    if (!offer || offer.deletedAt) throw new ApiError(404, "Offer not found");

    if (offer.buyerId.toString() !== buyerId.toString()) {
      throw new ApiError(403, "You do not own this offer");
    }

    if (offer.status !== "accepted") {
      throw new ApiError(400, "Only accepted offers can be paid");
    }

    const listing = await listingService.findListingById(offer.listingId);
    if (!listing || listing.deletedAt) {
      throw new ApiError(404, "Listing not found");
    }

    const existing = await paymentService.findTransactionByOfferId(offerId);
    if (existing) {
      throw new ApiError(409, "A transaction already exists for this offer");
    }

    const amountInCents = Math.round(listing.displayPrice);
    if (!Number.isInteger(amountInCents) || amountInCents < 50) {
      throw new ApiError(400, "Invalid listing price for payment");
    }

    const vendorAmount = Math.round(listing.askingPrice);
    const commission = amountInCents - vendorAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      //metadata means the data that is sent to the stripe payment intent and stors the record in bank stripe
      automatic_payment_methods:{
        enabled:true,
        allow_redirects:"never",
      },
      metadata: {
        offerId: offerId.toString(),
        buyerId: buyerId.toString(),
        listingId: listing._id.toString(),
        vendorId: listing.vendorId.toString(),
      },
    });

    const transaction = await paymentService.createTransaction({
      buyerId,
      vendorId: listing.vendorId,
      listingId: listing._id,
      offerId,
      amount: amountInCents,
      vendorAmount,
      commission,
      commissionPercent: listing.commissionPercent,
      currency: "usd",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: paymentIntent.status,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { clientSecret: paymentIntent.client_secret, transactionId: transaction._id },
          "Payment intent created"
        )
      );
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error("Webhook signature verification failed", err.message);
    return res.status(400).json({ error: "Webhook signature invalid" });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const { offerId, listingId, vendorId } = intent.metadata;

      const transaction = await paymentService.findTransactionByIntentId(intent.id);
      if (!transaction) {
        logger.error("Webhook: transaction not found for intent", intent.id);
        return res.status(200).json({ received: true });
      }

      if (transaction.status === "escrowed") {
        return res.status(200).json({ received: true });
      }

      await paymentService.updateTransactionById(transaction._id, {
        status: "escrowed",
        stripePaymentStatus: intent.status,
        escrowedAt: new Date(),
      });

      await listingService.updateListingById(listingId, { status: "sold" });

      await notificationService.create({
        userId: vendorId,
        type: "payment_escrowed",
        title: "Payment received",
        body: "A buyer has paid for your vehicle. Please arrange delivery to release your funds.",
        data: {
          transactionId: transaction._id,
          listingId,
          offerId,
        },
      });

      logger.info(`Transaction ${transaction._id} moved to escrowed`);
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      const transaction = await paymentService.findTransactionByIntentId(intent.id);
      if (transaction) {
        await paymentService.updateTransactionById(transaction._id, {
          status: "failed",
          stripePaymentStatus: intent.status,
        });
        logger.warn(`Transaction ${transaction._id} marked failed`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Webhook handler error", err);
    return res.status(200).json({ received: true });
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const { error, value } = confirmDeliverySchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const buyerId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, "Transaction not found");
    }

    if (transaction.buyerId.toString() !== buyerId.toString()) {
      throw new ApiError(403, "Only the buyer can confirm delivery");
    }

    if (transaction.status !== "escrowed") {
      throw new ApiError(400, "Transaction is not in escrow");
    }

    const wallet = await walletService.findOrCreateWallet(
      transaction.vendorId,
      transaction.currency
    );

    const updatedWallet = await walletService.creditWallet(
      wallet._id,
      transaction.vendorAmount
    );

    await walletService.createLedgerEntry({
      walletId: wallet._id,
      userId: transaction.vendorId,
      type: "credit",
      amount: transaction.vendorAmount,
      balanceAfter: updatedWallet.balance,
      reference: transaction._id,
      description: `Sale proceeds from listing ${transaction.listingId}`,
    });

    await paymentService.updateTransactionById(transaction._id, {
      status: "released",
      releasedAt: new Date(),
    });

    await notificationService.create({
      userId: transaction.vendorId,
      type: "payment_released",
      title: "Funds released",
      body: `Your payment of ${(transaction.vendorAmount / 100).toFixed(2)} has been released to your wallet.`,
      data: {
        transactionId: transaction._id,
        listingId: transaction.listingId,
      },
    });
    let invoice = null;
    try {
      transaction.status = "released";
      invoice = await invoiceService.generateInvoiceForTransaction(transaction);
    } catch (invoiceErr) {
      logger.error("Invoice generation failed (non-blocking)", invoiceErr);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { transactionId, invoice },
        "Delivery confirmed and funds released"
      )
    );
  } catch (err) {
    next(err);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const { error, value } = getTransactionSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const userId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, "Transaction not found");
    }

    const isBuyer = transaction.buyerId.toString() === userId.toString();
    const isVendor = transaction.vendorId.toString() === userId.toString();

    if (!isBuyer && !isVendor) {
      throw new ApiError(403, "Access denied");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { transaction }, "Transaction fetched"));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  confirmDelivery,
  getTransaction,
};