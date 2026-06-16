const rateLimit = require("express-rate-limit");

// Strict limiter for auth endpoints (prevent brute-force) only for [auth routes]
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter [for all routes]
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  // RateLimit-Limit: 3
  // RateLimit-Remaining: 1
  // RateLimit-Reset: 600
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
