const mongoose = require("mongoose");

const ucpCheckoutSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", default: null },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    currency: { type: String, required: true, default: "EUR" },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["incomplete", "ready_for_complete", "completed", "canceled"],
      default: "incomplete",
    },
    buyer: { type: mongoose.Schema.Types.Mixed, default: null },
    continueUrl: { type: String, default: null },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
    stripeCheckoutSessionId: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UcpCheckoutSession", ucpCheckoutSessionSchema);