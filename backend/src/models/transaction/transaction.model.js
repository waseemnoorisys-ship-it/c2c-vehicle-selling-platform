const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    vendorAmount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    commissionPercent: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "escrowed", "released", "refunded", "failed"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentStatus: {
      type: String,
      default: null,
    },
    escrowedAt: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);



// We need the Transaction schema because:

// It records every payment attempt made in the system.
// It links the buyer, vendor, listing, and offer together.
// It stores the payment amount and commission details.
// It keeps the Stripe Payment Intent ID for tracking.
// It tracks the payment status (pending, escrowed, released, etc.).
// It provides a complete payment history for audits.
// It helps manage escrow and fund release workflows.
// It supports refunds and failed payment handling.
// It prevents duplicate transactions using unique fields.
// It serves as the single source of truth for all payment-related records.