const rateLimit = require("express-rate-limit");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

function rateLimitHandler(req, res) {
  const lang = getLang(req);
  res.status(429).json({
    success: false,
    message: t("errors.common.tooManyRequests", lang),
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 201,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,

  
});

module.exports = { authLimiter, generalLimiter };
