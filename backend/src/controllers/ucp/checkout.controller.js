const crypto = require("crypto");
const mongoose = require("mongoose");
const Offer = require("../../models/offer/offer.model");
const Listing = require("../../models/listing/listing.model");
const Transaction = require("../../models/transaction/transaction.model");
const UcpCheckoutSession = require("../../models/ucpCheckoutSession/ucpCheckoutSession.model");
const { UCP_VERSION } = require("../../ucp/ucp.profile");

const CURRENCY = process.env.UCP_CURRENCY || "USD";

function metadata(status = "success") {
  return {
    version: UCP_VERSION,
    status,
    capabilities: {
      "dev.ucp.shopping.checkout": [{ version: UCP_VERSION }],
    },
  };
}

function continueUrl(offerId) {
  const baseUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${baseUrl}/buyer/offers?offerId=${offerId}`;
}

function toCheckout(session) {
  return {
    ucp: metadata(),
    id: session.sessionId,
    status: session.status,
    currency: session.currency,
    buyer: session.buyer || undefined,
    line_items: [
      {
        id: "line_1",
        item: { id: session.listingId.toString() },
        quantity: 1,
        totals: [
          { type: "subtotal", amount: session.amount },
          { type: "total", amount: session.amount },
        ],
      },
    ],
    totals: [
      { type: "subtotal", display_text: "Subtotal", amount: session.amount },
      { type: "total", display_text: "Total", amount: session.amount },
    ],
    messages: [
      {
        type: "info",
        code: "accepted_offer_payment_handoff",
        content: "Continue on the C2C vehicle platform to complete payment for this accepted offer.",
        severity: "recoverable",
      },
    ],
    continue_url: session.continueUrl,
  };
}

async function createCheckout(req, res, next) {
  try {
    const { offer_id: offerId, buyer, line_items: lineItems } = req.body || {};
    let offer = null;
    let listing = null;

    if (mongoose.isValidObjectId(offerId)) {
      offer = await Offer.findOne({
        _id: offerId,
        buyerId: req.user._id,
        status: "accepted",
        deletedAt: null,
      }).populate("listingId");
      listing = offer?.listingId;
    } else {
      const listingId = lineItems?.[0]?.item?.id;
      if (mongoose.isValidObjectId(listingId)) {
        listing = await Listing.findOne({
          _id: listingId,
          status: "approved",
          deletedAt: null,
        });
      }
    }

    if (!listing) {
      return res.json({
        ucp: metadata("error"),
        messages: [{ type: "error", code: "item_unavailable", content: "The vehicle is unavailable for purchase.", severity: "unrecoverable" }],
      });
    }

    const existing = await UcpCheckoutSession.findOne({
      ...(offer ? { offerId: offer._id } : { listingId: listing._id, offerId: null }),
      buyerId: req.user._id,
    });
    if (existing && existing.status !== "canceled") return res.json(toCheckout(existing));

    const session = await UcpCheckoutSession.create({
      sessionId: `ucp_chk_${crypto.randomUUID()}`,
      buyerId: req.user._id,
      offerId: offer?._id || null,
      listingId: listing._id,
      currency: CURRENCY,
      amount: Math.round(offer.listingId.displayPrice),
      buyer: buyer || { email: req.user.email },
      continueUrl: continueUrl(offer?._id || listing._id),
    });

    return res.status(201).json(toCheckout(session));
  } catch (error) {
    next(error);
  }
}

async function getCheckout(req, res, next) {
  try {
    const session = await UcpCheckoutSession.findOne({
      sessionId: req.params.id,
      buyerId: req.user._id,
    });
    if (!session) return res.status(404).json({ code: "not_found", content: "Checkout session not found" });
    return res.json(toCheckout(session));
  } catch (error) {
    next(error);
  }
}

async function updateCheckout(req, res, next) {
  try {
    const session = await UcpCheckoutSession.findOneAndUpdate(
      { sessionId: req.params.id, buyerId: req.user._id, status: { $ne: "canceled" } },
      { buyer: req.body?.buyer || null },
      { new: true },
    );
    if (!session) return res.status(404).json({ code: "not_found", content: "Checkout session not found" });
    return res.json(toCheckout(session));
  } catch (error) {
    next(error);
  }
}

async function completeCheckout(req, res, next) {
  try {
    const session = await UcpCheckoutSession.findOne({ sessionId: req.params.id, buyerId: req.user._id });
    if (!session) return res.status(404).json({ code: "not_found", content: "Checkout session not found" });

    if (session.stripeCheckoutSessionId) {
      return res.json({
        ...toCheckout(session),
        continue_url: session.continueUrl,
      });
    }

    const listing = await Listing.findOne({
      _id: session.listingId,
      deletedAt: null,
      ...(session.offerId ? {} : { status: "approved" }),
    });
    if (!listing) {
      return res.json({
        ucp: metadata("error"),
        messages: [{ type: "error", code: "item_unavailable", content: "The vehicle is no longer available.", severity: "unrecoverable" }],
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        code: "payment_unavailable",
        content: "Payment processing is not configured",
      });
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    let offer = session.offerId
      ? await Offer.findOne({ _id: session.offerId, buyerId: req.user._id, status: "accepted", deletedAt: null })
      : null;

    if (!offer) {
      offer = await Offer.create({
        buyerId: req.user._id,
        listingId: listing._id,
        vendorId: listing.vendorId,
        amount: session.amount,
        status: "accepted",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        message: "Direct UCP purchase",
      });
      session.offerId = offer._id;
    }

    const commission = session.amount - Math.round(listing.askingPrice);
    const transaction = await Transaction.create({
      buyerId: req.user._id,
      vendorId: listing.vendorId,
      listingId: listing._id,
      offerId: offer._id,
      amount: session.amount,
      vendorAmount: Math.round(listing.askingPrice),
      commission,
      commissionPercent: listing.commissionPercent,
      currency: CURRENCY.toLowerCase(),
      status: "pending",
      stripePaymentIntentId: `ucp-checkout-${session.sessionId}`,
      stripePaymentStatus: "pending",
    });

    const baseUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: CURRENCY.toLowerCase(),
          unit_amount: session.amount,
          product_data: { name: listing.title || "Vehicle purchase" },
        },
        quantity: 1,
      }],
      metadata: {
        offerId: offer._id.toString(),
        buyerId: req.user._id.toString(),
        listingId: listing._id.toString(),
        vendorId: listing.vendorId.toString(),
        transactionId: transaction._id.toString(),
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      customer_email: req.user.email,
    });

    session.transactionId = transaction._id;
    session.stripeCheckoutSessionId = stripeSession.id;
    session.continueUrl = stripeSession.url || session.continueUrl;
    await session.save();

    return res.json({
      ...toCheckout(session),
      status: "incomplete",
      messages: [{
        type: "error",
        code: "requires_buyer_input",
        content: "Open continue_url to complete payment securely.",
        severity: "recoverable",
      }],
    });
  } catch (error) {
    next(error);
  }
}

async function cancelCheckout(req, res, next) {
  try {
    const session = await UcpCheckoutSession.findOneAndUpdate(
      { sessionId: req.params.id, buyerId: req.user._id, status: { $nin: ["completed", "canceled"] } },
      { status: "canceled" },
      { new: true },
    );
    if (!session) return res.status(404).json({ code: "not_found", content: "Checkout session not found" });
    return res.json(toCheckout(session));
  } catch (error) {
    next(error);
  }
}

module.exports = { createCheckout, getCheckout, updateCheckout, completeCheckout, cancelCheckout };