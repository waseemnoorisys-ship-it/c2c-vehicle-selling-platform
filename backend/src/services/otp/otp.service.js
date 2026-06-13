const bcrypt      = require("bcryptjs");
const OTP         = require("../../models/otp/otp.model");
const generateOTP = require("../../utils/generateOTP");
const ApiError    = require("../../utils/ApiError");

const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
const MAX_ATTEMPTS    = 5;

// Create and store a new OTP (invalidates any previous for same user+type)
async function createOTP(userId, email, type) {
  // Invalidate old OTPs of same type
  await OTP.updateMany(
    { userId, type, isUsed: false },
    { $set: { isUsed: true } }
  );

  const plain   = generateOTP(6);
  const hash    = await bcrypt.hash(plain, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

  await OTP.create({ userId, email, type, otpHash: hash, expiresAt });
  return plain; // return plain to send via email — never stored in DB
}

// Verify an OTP — returns true or throws ApiError
async function verifyOTP(userId, type, plainOtp) {
  const record = await OTP.findOne({
    userId,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 }); // most recent first

  if (!record) throw new ApiError(400, "OTP expired or not found. Request a new one.");

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new ApiError(400, "Too many wrong attempts. Request a new OTP.");
  }

  const isMatch = await bcrypt.compare(plainOtp, record.otpHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts left.`);
  }

  // Mark used
  record.isUsed = true;
  await record.save();
  return true;
}

module.exports = { createOTP, verifyOTP };