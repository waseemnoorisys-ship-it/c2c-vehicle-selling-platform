const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ email: 1 });

module.exports = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);
