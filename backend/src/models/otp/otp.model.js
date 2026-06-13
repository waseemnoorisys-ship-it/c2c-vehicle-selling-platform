const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email:   { type: String, required: true, lowercase: true },
    type:    { type: String, enum: ["email_verify", "password_reset"], required: true },
    otpHash: { type: String, required: true },   // bcrypt hash — never store plain OTP
    expiresAt: { type: Date, required: true },
    isUsed:    { type: Boolean, default: false },
    attempts:  { type: Number, default: 0 },     // track wrong guesses
  },
  { timestamps: true }
);

// WHY TTL index: MongoDB auto-deletes expired OTP docs.
// Belt-and-suspenders: we also check expiresAt manually.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("OTP", otpSchema);