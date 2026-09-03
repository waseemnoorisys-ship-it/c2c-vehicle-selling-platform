const rateLimit = require("express-rate-limit");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

const isTrustedInternal = (req) => {
  const secretHeader = req.headers["x-mcp-internal-secret"];
  const configuredSecret = process.env.MCP_INTERNAL_SECRET;
  if (secretHeader && configuredSecret && secretHeader === configuredSecret) {
    return true; // Skip rate limiter for trusted internal MCP server
  }
  return false;
};

function rateLimitHandler(req, res) {
  const lang = getLang(req);
  res.status(429).json({
    success: false,
    message: t("errors.common.tooManyRequests", lang),
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: isTrustedInternal,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  skip: isTrustedInternal,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
