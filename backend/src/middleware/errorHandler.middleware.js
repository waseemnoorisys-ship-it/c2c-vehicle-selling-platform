const logger = require("../config/logger");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} — ${err.message}`, err);
  const lang = getLang(req);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: t("errors.common.validationError", lang), errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: t("errors.common.alreadyExists", lang, { field }),
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: t("errors.common.invalidToken", lang) });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: t("errors.common.tokenExpired", lang) });
  }

  return res.status(500).json({
    success: false,
    message: t("errors.common.internal", lang),
  });
}

module.exports = errorHandler;
