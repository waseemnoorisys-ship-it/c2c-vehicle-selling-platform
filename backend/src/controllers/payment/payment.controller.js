// const stripe = require("../../config/stripe");
// isme hum ek function banayenge jiske through stripe api call karenge and yeh function hum use karke hum ek payment intent create karenge
require("dotenv").config();
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
// const createPaymentIntent = async (req, res, next) => {
//   try {
//     const lang = getLang(req);
//     const { error, value } = createIntentSchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { offerId } = value;
//     const buyerId = req.user._id;

//     const offer = await offerService.findOfferById(offerId);
//     if (!offer || offer.deletedAt) throw new ApiError(404, t("errors.payment.offerNotFound", lang));

//     if (offer.buyerId.toString() !== buyerId.toString()) {
//       throw new ApiError(403, t("errors.payment.notOwner", lang));
//     }

//     if (offer.status !== "accepted") {
//       throw new ApiError(400, t("errors.payment.onlyAccepted", lang));
//     }

//     const listing = await listingService.findListingById(offer.listingId);
//     if (!listing || listing.deletedAt) {
//       throw new ApiError(404, t("errors.payment.listingNotFound", lang));
//     }

//     const existing = await paymentService.findTransactionByOfferId(offerId);
//     if (existing) {
//       throw new ApiError(409, t("errors.payment.transactionExists", lang));
//     }

//     const amountInCents = Math.round(listing.displayPrice);
//     if (!Number.isInteger(amountInCents) || amountInCents < 50) {
//       throw new ApiError(400, t("errors.payment.invalidPrice", lang));
//     }

//     const vendorAmount = Math.round(listing.askingPrice);
//     const commission = amountInCents - vendorAmount;
//     const baseUrl = process.env.APP_URL || "http://localhost:5000";

//     const tempTransactionId = `checkout-${offerId}-${Date.now()}`;
//     const transaction = await paymentService.createTransaction({
//       buyerId,
//       vendorId: listing.vendorId,
//       listingId: listing._id,
//       offerId,
//       amount: amountInCents,
//       vendorAmount,
//       commission,
//       commissionPercent: listing.commissionPercent,
//       currency: "usd",
//       status: "pending",
//       stripePaymentIntentId: tempTransactionId,
//       stripePaymentStatus: "pending",
//     });

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             unit_amount: amountInCents,
//             product_data: {
//               name: listing.title || "Vehicle purchase",
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         offerId: offerId.toString(),
//         buyerId: buyerId.toString(),
//         listingId: listing._id.toString(),
//         vendorId: listing.vendorId.toString(),
//         transactionId: transaction._id.toString(),
//       },
//       success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${baseUrl}/payment/cancel`,
//       customer_email: req.user?.email || undefined,
//     });

//     await paymentService.updateTransactionById(transaction._id, {
//       stripePaymentIntentId: session.id,
//       stripePaymentStatus: session.payment_status || "pending",
//     });

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           checkoutUrl: session.url,
//           sessionId: session.id,
//           transactionId: transaction._id,
//           clientSecret: null,
//         },
//         t("success.payment.intentCreated", lang)
//       )
//     );
//   } catch (err) {
//     next(err);
//   }
// };


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
      throw new ApiError(
        404,
        t("errors.payment.offerNotFound", lang)
      );
    }

    if (offer.buyerId.toString() !== buyerId.toString()) {
      throw new ApiError(
        403,
        t("errors.payment.notOwner", lang)
      );
    }

    if (offer.status !== "accepted") {
      throw new ApiError(
        400,
        t("errors.payment.onlyAccepted", lang)
      );
    }

    const listing = await listingService.findListingById(offer.listingId);

    if (!listing || listing.deletedAt) {
      throw new ApiError(
        404,
        t("errors.payment.listingNotFound", lang)
      );
    }

    const existing = await paymentService.findTransactionByOfferId(offerId);

    if (existing) {
      throw new ApiError(
        409,
        t("errors.payment.transactionExists", lang)
      );
    }

    const amountInCents = Math.round(listing.displayPrice);

    if (!Number.isInteger(amountInCents) || amountInCents < 50) {
      throw new ApiError(
        400,
        t("errors.payment.invalidPrice", lang)
      );
    }

    const vendorAmount = Math.round(listing.askingPrice);
    const commission = amountInCents - vendorAmount;

    const baseUrl =
      process.env.APP_URL;

    // Temporary value before Stripe session is created
    const tempTransactionId = `checkout-${offerId}-${Date.now()}`;

    // 1. Create transaction in your database
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
      stripePaymentIntentId: tempTransactionId,
      stripePaymentStatus: "pending",
    });

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: listing.title || "Vehicle purchase",
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
        transactionId: transaction._id.toString(),
      },

      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,

      customer_email: req.user?.email || undefined,
    });
    console.log("APP_URL:", baseUrl);
    console.log("SUCCESS URL:", `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`);
    console.log("CANCEL URL:", `${baseUrl}/payment/cancel`);

    // 3. Save Stripe Checkout Session ID
    await paymentService.updateTransactionById(
      transaction._id,
      {
        stripePaymentIntentId: session.id,
        stripePaymentStatus:
          session.payment_status || "pending",
      }
    );

    // 4. IMPORTANT:
    // Do NOT return session.url directly.
    // Return your own backend checkout URL.
    const checkoutUrl =
      `${baseUrl}/api/v1/payments/checkout/${transaction._id}`;

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
    next(err);
  }
};




// ============================================================
// Stripe Checkout Redirect (for MCP) -- change for mcp
// ============================================================
const redirectToStripeCheckout = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await paymentService.findTransactionById(transactionId);

    if (!transaction || transaction.deletedAt) {
      throw new ApiError(404, "Transaction not found");
    }

    // The transaction stores the Stripe Checkout Session ID
    const session = await stripe.checkout.sessions.retrieve(
      transaction.stripePaymentIntentId
    );

    if (!session || !session.url) {
      throw new ApiError(404, "Stripe checkout session not found");
    }

    // IMPORTANT:
    // Do not modify session.url.
    // Redirect directly to the URL returned by Stripe.
    return res.redirect(302, session.url);
  } catch (err) {
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