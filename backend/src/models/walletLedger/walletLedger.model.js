const mongoose = require("mongoose");

const walletLedgerSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    //caused by which transaction
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletLedger", walletLedgerSchema);



// WalletLedger Saves

// ✔ Credit
// ✔ Amount = 500
// ✔ Balance After = 600
// ✔ Transaction ID
// ✔ Description = "Payment for Listing"
// ✔ Date & Time