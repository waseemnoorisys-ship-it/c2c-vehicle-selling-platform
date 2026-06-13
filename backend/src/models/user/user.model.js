const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName:       { type: String, required: true, trim: true },
    lastName:        { type: String, required: true, trim: true },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile:          { type: String, required: true },
    countryCode:     { type: String, default: "+33" },
    passwordHash:    { type: String, required: true },
    role:            { type: String, enum: ["buyer", "vendor"], required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
    profilePhoto:    { type: String, default: null },  // S3 URL
    language:        { type: String, enum: ["en", "fr"], default: "en" },
    deletedAt:       { type: Date, default: null },    // GDPR soft delete
  },
  { timestamps: true }
);

// WHY index on email: every login + OTP lookup queries by email
// CHANGED: removed duplicate email index line Date[13/06/2026] becuase of this error [ (node:10248) [MONGOOSE] Warning: mongoose: Duplicate schema index on {"email":1} for model "User". This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.]
// userSchema.index({ email: 1 },{unique:true});
userSchema.index({ role: 1, isActive: 1 });

// Instance method — compare plain password with stored hash
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Static: find active non-deleted user by email
userSchema.statics.findActiveByEmail = function (email) {
  return this.findOne({ email, deletedAt: null });
};

module.exports = mongoose.model("User", userSchema);