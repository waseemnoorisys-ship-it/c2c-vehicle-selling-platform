const crypto = require("crypto");

// WHY crypto instead of Math.random():
// Math.random() is not cryptographically secure.
// crypto.randomInt gives truly random, unpredictable OTPs.
function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

module.exports = generateOTP;