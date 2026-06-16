const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true }, // hashed refresh token if db leak so hacker cant acces the real token
    userAgent: { type: String },//userAgent : IOS ,Android , Windows//userAgent : chrome , firefox , brave on windows,
    ip:        { type: String },
    isRevoked: { type: Boolean, default: false },//revoked:true [true gya tata byby] if user logout in 1 day so we have to marke as revoked and dont allow it to see the page. why suddenly revoked true instead of waiting more 6 days [Token is exist BUT BUT BUT it can't be used anymore] 
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// WHY hash refresh token: if DB is compromised, attacker can't use raw tokens
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });//Creates a TTL index that automatically deletes refresh token documents when their expiresAt time is reached.

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);