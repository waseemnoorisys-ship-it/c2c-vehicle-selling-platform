//why do we need of otp schema
// User clicks "Forgot Password"
//             ↓
// Server generates OTP
// (123456)
//             ↓
// Save in OTP Collection

// {
//   userId: "123",
//   otp: "123456",
//   type: "forgot_password",
//   expiresAt: 10:30 AM
// }

//             ↓
// Send OTP to Email
//             ↓
// User receives OTP
//             ↓
// User enters 123456
//             ↓
// Server searches OTP Collection
//             ↓
// OTP Found?
//             ↓
//        Yes ✅
//             ↓
// OTP Expired?
//             ↓
//        No ✅
//             ↓
// Allow Password Reset
//             ↓
// Delete OTP
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true, lowercase: true },
    type: {
      type: String,
      enum: ["email_verify", "password_reset"],
      required: true,
    },
    otpHash: { type: String, required: true }, // bcrypt hash — never store plain OTP
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 }, // track wrong guesses
  },
  { timestamps: true },
);

// WHY TTL index: MongoDB auto-deletes expired OTP docs.
// Belt-and-suspenders: we also check expiresAt manually.
//Automatically delete OTP documents when expiresAt time is reached.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// await OTP.findOne({
// userId: "123",
// type: "email_verification"
// });
otpSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("OTP", otpSchema);
