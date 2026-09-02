// const stripe = require("../../config/stripe");
// isme hum ek function banayenge jiske through stripe api call karenge and yeh function hum use karke hum ek payment intent create karenge
require("dotenv").config();
const mongoose = require("mongoose");
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
//sprint 9 push notification
const { sendPushNotification } = require("../../services/push/push.service");
const { sendEmail } = require("../../services/email/email.service");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");
const userService = require("../../services/user/user.service");
const chatService = require("../../services/chat/chat.service");







//iss ka kaam hai sirf  bill banana/ready karna  like petroll pump bill/paper  

//how many events we are handling in our project of stripe webhooks?
//we are handling 2 events in our project of stripe webhooks
//1. payment_intent.succeeded
//2. payment_intent.payment_failed
//3. payment_intent.created
//4. payment_intent.updated
//5. payment_intent.payment_method_attached
//6. payment_intent.payment_method_detached
//7. payment_intent.payment_method_expired
//8. payment_intent.payment_method_failed
//9. payment_intent.payment_method_garbage_collected
function cleanUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url
    .replace(/[\r\n\t]/g, "")
    .trim()
    .replace(/\/+$/, "");
}

function resolveBaseUrl(req) {
  const envAppUrl = cleanUrl(process.env.APP_URL);
  if (envAppUrl) {
    return envAppUrl;
  }
  const envLiveBackendUrl = cleanUrl(process.env.LIVE_BACKEND_URL);
  if (envLiveBackendUrl) {
    return envLiveBackendUrl;
  }
  if (req) {
    const host = cleanUrl(req.get("x-forwarded-host") || req.get("host"));
    const proto = cleanUrl(req.get("x-forwarded-proto") || req.protocol || "http");
    if (host) {
      return `${proto}://${host}`.replace(/[\r\n\t]/g, "").trim().replace(/\/+$/, "");
    }
  }
  return "https://c2c-vehicle-selling-platform.onrender.com";
}

function resolveFrontendUrl() {
  const envFrontendUrl = cleanUrl(process.env.FRONTEND_URL);
  if (envFrontendUrl) {
    return envFrontendUrl;
  }
  const envClientUrl = cleanUrl(process.env.CLIENT_URL);
  if (envClientUrl) {
    return envClientUrl;
  }
  return "https://c2c-vehicle-selling-platform.vercel.app";
}

const createPaymentIntent = async (req, res, next) => {
  try {
    const lang = getLang(req);

    const { error, value } = createIntentSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    const { offerId } = value;
    const buyerId = req.user._id;

    const offer = await offerService.findOfferById(offerId);

    if (!offer || offer.deletedAt) {
      throw new ApiError(404, t("errors.payment.offerNotFound", lang));
    }

    if (offer.buyerId.toString() !== buyerId.toString()) {
      throw new ApiError(403, t("errors.payment.notOwner", lang));
    }

    if (offer.status !== "accepted") {
      throw new ApiError(400, t("errors.payment.onlyAccepted", lang));
    }

    const listing = await listingService.findListingById(offer.listingId);

    if (!listing || listing.deletedAt) {
      throw new ApiError(404, t("errors.payment.listingNotFound", lang));
    }

    // Purchase price in minor units (paise/cents) is the accepted offer amount
    const amountInMinorUnits = Math.round(Number(offer.amount));

    if (!Number.isInteger(amountInMinorUnits) || amountInMinorUnits < 50) {
      throw new ApiError(400, t("errors.payment.invalidPrice", lang));
    }

    const commissionPercent =
      listing.commissionPercent != null ? listing.commissionPercent : 5;
    const commission = Math.round((amountInMinorUnits * commissionPercent) / 100);
    const vendorAmount = amountInMinorUnits - commission;
    const currency = (process.env.STRIPE_CURRENCY || "inr").toLowerCase();

    const baseUrl = resolveBaseUrl(req);
    const frontendUrl = resolveFrontendUrl();

    const existing = await paymentService.findTransactionByOfferId(offerId);

    // If transaction is already completed (escrowed or released), prevent duplicate payments
    if (
      existing &&
      (existing.status === "escrowed" || existing.status === "released")
    ) {
      throw new ApiError(
        409,
        t("errors.payment.transactionExists", lang) ||
          "Payment has already been completed for this offer."
      );
    }

    let transaction = existing;
    let session = null;

    // If a pending transaction already exists, check if its Stripe session is still active
    if (
      existing &&
      existing.status === "pending" &&
      existing.stripePaymentIntentId &&
      existing.stripePaymentIntentId.startsWith("cs_")
    ) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          existing.stripePaymentIntentId
        );
        if (
          existingSession &&
          existingSession.status === "open" &&
          existingSession.payment_status === "unpaid"
        ) {
          session = existingSession;
          logger.info(
            `Reusing active Stripe checkout session ${session.id} for offer ${offerId}`
          );
        }
      } catch (retrieveErr) {
        logger.warn(
          `Could not retrieve existing Stripe session ${existing.stripePaymentIntentId}: ${retrieveErr.message}`
        );
      }
    }

    // If no active session exists, create a new Stripe Checkout session
    if (!session) {
      const tempTransactionId = existing
        ? existing._id.toString()
        : new mongoose.Types.ObjectId().toString();

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: amountInMinorUnits,
              product_data: {
                name: listing.title || "Vehicle Purchase",
                description: `${listing.year || ""} ${listing.title || "Vehicle"}`.trim(),
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          offerId: offerId.toString(),
          buyerId: buyerId.toString(),
          listingId: listing._id.toString(),
          vendorId: listing.vendorId.toString(),
          transactionId: tempTransactionId,
        },
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
        customer_email: req.user?.email || undefined,
      });

      logger.info(
        `Created new Stripe checkout session ${session.id} for offer ${offerId}`
      );

      if (existing) {
        transaction = await paymentService.updateTransactionById(
          existing._id,
          {
            amount: amountInMinorUnits,
            vendorAmount,
            commission,
            commissionPercent,
            currency,
            status: "pending",
            stripePaymentIntentId: session.id,
            stripePaymentStatus: session.payment_status || "pending",
          }
        );
      } else {
        transaction = await paymentService.createTransaction({
          _id: tempTransactionId,
          buyerId,
          vendorId: listing.vendorId,
          listingId: listing._id,
          offerId,
          amount: amountInMinorUnits,
          vendorAmount,
          commission,
          commissionPercent,
          currency,
          status: "pending",
          stripePaymentIntentId: session.id,
          stripePaymentStatus: session.payment_status || "pending",
        });
      }
    }

    // Construct backend redirect URL
    const cleanBaseUrl = resolveBaseUrl(req);
    const cleanTransactionId = String(transaction._id).replace(/[\r\n\t\s]/g, "");
    const checkoutUrl = `${cleanBaseUrl}/api/v1/payments/checkout/${cleanTransactionId}`;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          checkoutUrl,
          sessionId: session.id,
          transactionId: transaction._id,
          clientSecret: null,
        },
        t("success.payment.intentCreated", lang)
      )
    );
  } catch (err) {
    logger.error("createPaymentIntent failed", {
      message: err.message,
      stack: err.stack,
    });
    if (err.type && err.type.startsWith("Stripe")) {
      return next(new ApiError(400, `Stripe Error: ${err.message}`));
    }
    next(err);
  }
};

// ============================================================
// Stripe Checkout Redirect (for MCP & Web Checkout)
// ============================================================
const redirectToStripeCheckout = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await paymentService.findTransactionById(transactionId);

    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, "Transaction not found");
    }

    const baseUrl = resolveBaseUrl(req);

    // If transaction is already completed, redirect to success page
    if (
      transaction.status === "escrowed" ||
      transaction.status === "released"
    ) {
      return res.redirect(
        302,
        `${baseUrl}/payment/success?transaction_id=${transaction._id}&already_paid=true`
      );
    }

    let session = null;
    if (
      transaction.stripePaymentIntentId &&
      transaction.stripePaymentIntentId.startsWith("cs_")
    ) {
      try {
        session = await stripe.checkout.sessions.retrieve(
          transaction.stripePaymentIntentId
        );
      } catch (err) {
        logger.warn(
          `Failed to retrieve session ${transaction.stripePaymentIntentId}: ${err.message}`
        );
      }
    }

    // If session is expired, missing, or closed, self-heal by generating a fresh session
    if (!session || session.status !== "open" || !session.url) {
      const listing = await listingService.findListingById(
        transaction.listingId
      );
      const buyer = await userService.findById(transaction.buyerId);
      const currency = (
        transaction.currency ||
        process.env.STRIPE_CURRENCY ||
        "inr"
      ).toLowerCase();

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: transaction.amount,
              product_data: {
                name: listing?.title || "Vehicle Purchase",
                description: `${listing?.year || ""} ${listing?.title || "Vehicle"}`.trim(),
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          offerId: transaction.offerId.toString(),
          buyerId: transaction.buyerId.toString(),
          listingId: transaction.listingId.toString(),
          vendorId: transaction.vendorId.toString(),
          transactionId: transaction._id.toString(),
        },
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
        customer_email: buyer?.email || undefined,
      });

      await paymentService.updateTransactionById(transaction._id, {
        stripePaymentIntentId: session.id,
        stripePaymentStatus: session.payment_status || "pending",
      });
    }

    if (!session.url) {
      throw new ApiError(500, "Stripe checkout session URL is unavailable.");
    }

    // Redirect directly to Stripe Checkout
    return res.redirect(302, session.url);
  } catch (err) {
    logger.error("redirectToStripeCheckout failed", {
      message: err.message,
      transactionId: req.params?.transactionId,
    });
    if (err.type && err.type.startsWith("Stripe")) {
      return next(new ApiError(400, `Stripe Error: ${err.message}`));
    }
    next(err);
  }
};



//what is webhook?
//webhook is a way to get notified when a payment is successful or failed or any other event occurs in the stripe dashboard
//how many webhooks we are handling in our function?
//we are handling 2 webhooks in our function
//1. payment_intent.succeeded
//2. payment_intent.payment_failed
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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { offerId, listingId, vendorId, transactionId } = session.metadata || {};

      let transaction = null;
      if (transactionId) {
        transaction = await paymentService.findTransactionById(transactionId);
      }
      if (!transaction) {
        transaction = await paymentService.findTransactionByIntentId(session.id);
      }

      if (!transaction) {
        logger.error("Webhook: transaction not found for checkout session", session.id);
        return res.status(200).json({ received: true });
      }

      if (transaction.status === "escrowed") {
        return res.status(200).json({ received: true });
      }

      await paymentService.updateTransactionById(transaction._id, {
        status: "escrowed",
        stripePaymentStatus: session.payment_status || "paid",
        escrowedAt: new Date(),
      });

      if (listingId) {
        await listingService.updateListingById(listingId, { status: "sold" });
      }

      if (vendorId) {
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
        try {
          const vendorUser = await userService.findById(vendorId);
          const lang = vendorUser?.language || "en";

          await sendPushNotification({
            fcmToken: vendorUser?.fcmToken,
            title: t("payment.escrowed.title", lang),
            body: t("payment.escrowed.body", lang),
            data: { transactionId: transaction._id.toString() },
          });

          await sendEmail({
            to: vendorUser.email,
            templateName: "paymentEscrowed",
            data: { firstName: vendorUser.firstName, lang },
          });
        } catch (err) {
          logger.error("Payment escrowed notification failed", err);
        }
      }

      logger.info(`Transaction ${transaction._id} moved to escrowed`);
    }

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
      try {
        const vendorUser = await userService.findById(vendorId);
        const lang = vendorUser?.language || "en";

        await sendPushNotification({
          fcmToken: vendorUser?.fcmToken,
          title: t("payment.escrowed.title", lang),
          body: t("payment.escrowed.body", lang),
          data: { transactionId: transaction._id.toString() },
        });

        await sendEmail({
          to: vendorUser.email,
          templateName: "paymentEscrowed",
          data: { firstName: vendorUser.firstName, lang },
        });
      } catch (err) {
        logger.error("Payment escrowed notification failed", err);
      }

      logger.info(`Transaction ${transaction._id} moved to escrowed`);
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      const transaction = await paymentService.findTransactionByIntentId(session.id);
      if (transaction) {
        await paymentService.updateTransactionById(transaction._id, {
          status: "failed",
          stripePaymentStatus: session.payment_status || "expired",
        });
      }
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
    const lang = getLang(req);
    const { error, value } = confirmDeliverySchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const buyerId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, t("errors.payment.transactionNotFound", lang));
    }

    if (transaction.buyerId.toString() !== buyerId.toString()) {
      throw new ApiError(403, t("errors.payment.onlyBuyerConfirm", lang));
    }

    if (transaction.status !== "escrowed") {
      throw new ApiError(400, t("errors.payment.notInEscrow", lang));
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

    //update this block for chat is closed after sold or payment released
    try {
      await chatService.closeConversationsByListingId(transaction.listingId);
      logger.info(`Conversations closed for listing ${transaction.listingId}`);
    } catch (closeErr) {
      logger.error("Auto-close conversations failed (non-blocking)", closeErr);
    }

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
    try {
      const vendorUser = await userService.findById(transaction.vendorId);
      const lang = vendorUser?.language || "en";
      const formattedAmount = `$${(transaction.vendorAmount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: vendorUser?.fcmToken,
        title: t("payment.released.title", lang),
        body: t("payment.released.body", lang, { amount: formattedAmount }),
        data: { transactionId: transaction._id.toString() },
      });

      await sendEmail({
        to: vendorUser.email,
        templateName: "paymentReleased",
        data: {
          firstName: vendorUser.firstName,
          amount: formattedAmount,
          lang,
        },
      });
    } catch (err) {
      logger.error("Payment released notification failed", err);
    }
    let invoice = null;
    try {
      transaction.status = "released";
      invoice = await invoiceService.generateInvoiceForTransaction(transaction);

      if (invoice) {
        const [buyerUser, vendorUser] = await Promise.all([
          userService.findById(transaction.buyerId),
          userService.findById(transaction.vendorId),
        ]);
        const downloadUrl = invoiceService.getInvoiceDownloadUrl(invoice.url);

        const emailTasks = [];
        if (buyerUser?.email) {
          emailTasks.push(
            sendEmail({
              to: buyerUser.email,
              templateName: "invoiceReady",
              data: {
                firstName: buyerUser.firstName,
                invoiceNumber: invoice.invoiceNumber,
                downloadUrl,
                role: "buyer",
                lang: buyerUser.language || "en",
              },
            })
          );
        }
        if (vendorUser?.email) {
          emailTasks.push(
            sendEmail({
              to: vendorUser.email,
              templateName: "invoiceReady",
              data: {
                firstName: vendorUser.firstName,
                invoiceNumber: invoice.invoiceNumber,
                downloadUrl,
                role: "vendor",
                lang: vendorUser.language || "en",
              },
            })
          );
        }
        await Promise.all(emailTasks);
      }
    } catch (invoiceErr) {
      logger.error("Invoice generation failed (non-blocking)", invoiceErr);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { transactionId, invoice },
        t("success.payment.deliveryConfirmed", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = getTransactionSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const userId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, t("errors.payment.transactionNotFound", lang));
    }

    const isBuyer = transaction.buyerId.toString() === userId.toString();
    const isVendor = transaction.vendorId.toString() === userId.toString();

    if (!isBuyer && !isVendor) {
      throw new ApiError(403, t("errors.commonExtra.accessDenied", lang));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { transaction }, t("success.payment.transactionFetched", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentIntent,
  redirectToStripeCheckout,
  handleWebhook,
  confirmDelivery,
  getTransaction,
};