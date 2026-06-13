const logger   = require("../config/logger");
const ApiError = require("../utils/ApiError");

// WHY global error handler as last middleware:
// Catches every next(err) in the app so we never have duplicate
// error-response code in controllers.
function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} — ${err.message}`, err);

  // Known operational errors (ApiError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors:  err.errors,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation error", errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Unknown — don't leak internals
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorHandler;