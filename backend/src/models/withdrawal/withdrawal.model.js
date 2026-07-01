const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    bankDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetails",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedAt: {
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

module.exports = mongoose.model("Withdrawal", withdrawalSchema);