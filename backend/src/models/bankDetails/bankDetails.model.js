const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    accountNumberEncrypted: {
      type: String,
      required: true,
    },
    ifscOrRoutingEncrypted: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankDetails", bankDetailsSchema);