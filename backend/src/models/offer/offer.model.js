// WHY this model exists:
// Core C2C mechanic — buyers negotiate price instead of paying fixed price.
// Vendor accepts/rejects in Sprint 4. Payment triggered on accept in Sprint 5.

const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    buyerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true, // WHY: GET /offers/mine queries by buyerId
    },

    listingId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Listing",
      required: true,
      index:    true,
    },

    // WHY denormalize vendorId here:
    // Sprint 4 needs GET /offers/received — all offers on vendor's listings.
    // Without vendorId on the offer, every query would need to join through
    // Listing to find the vendor. Denormalizing makes Sprint 4 query direct.
    vendorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    // WHY cents (integer):
    // same rule as listing prices — no floating point money bugs.
    // $10,500 offer → stored as 1050000
    amount: {
      type:     Number,
      required: true,
      min:      [1, "Offer amount must be at least 1 cent"],
    },

    status: {
      type:    String,
      enum:    ["pending", "accepted", "rejected", "expired", "withdrawn"],
      default: "pending",
      index:   true,
    },

    // WHY optional message:
    // buyer can add context — "can pick up this weekend", "price firm?"
    // Helps vendor make a decision without back-and-forth messages.
    message: {
      type:      String,
      trim:      true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    // WHY expiresAt (not a TTL index like OTP):
    // we want the offer RECORD to remain for audit history.
    // TTL would delete the document. Instead we check expiresAt
    // in the service layer and update status to "expired" on read.
    expiresAt: {
      type:     Date,
      required: true,
    },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// WHY compound index on buyerId + listingId + status:
// enforces the business rule check (one pending offer per buyer per listing)
// and makes that lookup fast.
offerSchema.index({ buyerId: 1, listingId: 1, status: 1 });

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;