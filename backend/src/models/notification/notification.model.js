// src/models/notification/notification.model.js
// WHY: Notifications are stored as DB documents so users can see
// their full history, mark as read, and we can count unread badges.
// Sprint 9 will add FCM push on top of this — the DB record is the
// source of truth regardless of whether push delivery succeeded.

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // WHY indexed: every query filters by userId first
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    // WHY enum for type: lets frontend render the right icon/color
    // per notification type without parsing the message string.
    type: {
      type: String,
      enum: [
        "offer_received",   // vendor: new offer on your listing
        "offer_accepted",   // buyer: your offer was accepted
        "offer_rejected",   // buyer: your offer was rejected
        "offer_expired",    // buyer: your offer expired
        "offer_withdrawn",  // vendor: buyer withdrew their offer
        "payment_escrowed", // vendor: payment was escrowed
        "payment_released", // vendor: payment was released
      ],
      required: true,
    },

    title: {
      type:     String,
      required: true,
      trim:     true,
    },

    body: {
      type:     String,
      required: true,
      trim:     true,
    },

    // WHY data object: stores IDs for deep linking on frontend.
    // Frontend reads data.listingId to navigate to the listing page.
    // data.offerId to open the offer detail.
    // Flexible object — different notification types carry different data.
    data: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},                  
    },

    isRead:    { type: Boolean, default: false },
    deletedAt: { type: Date,    default: null  }, // soft delete
  },
  { timestamps: true }
);

// WHY compound index: most common query is unread notifications
// for a user sorted newest first.
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;