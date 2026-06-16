const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

//example of how we can see expect error
//logger.error(`${req.method} ${req.url} — ${err.message}`, err);
//[2026-06-15 13:33:28] ERROR: POST /api/v1/auth/login — Invalid email or password Invalid email or password
//Error: Invalid email or password
//    at Object.login (C:\Users\shoae\Desktop\C2C Vehicle Selling Platform\backend\src\services\auth\auth.service.js:81:23)
//    at async login (C:\Users\shoae\Desktop\C2C Vehicle Selling Platform\backend\src\controllers\auth\auth.controller.js:30:20)

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
      errors: err.errors,
    });
  }

  //err
  // └── errors[(e)e.message]
  //  ├── email
  //  │     └── message: "Email is required"
  //    └── password
  //            └── message: "Password must be at least 8 characters"
  //example how can we find it using object.values
  // const err = {
  //   name: "ValidationError",
  //   message: "User validation failed",
  //   errors: {
  //     email: {
  //       message: "Email is required",
  //       path: "email",
  //       kind: "required"
  //     },
  //     password: {
  //       message: "Password must be at least 8 characters",
  //       path: "password",
  //       kind: "minlength"
  //     }
  //   }
  // };
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: "Validation error", errors });
  }

  // Mongoose duplicate key
  //const err = {
  // code: 11000,
  // keyValue: {
  // email: "john@gmail.com"
  // }
  // };
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


  // return res.status(500).json({
  //   success:false,
  //   message:err.message
  // })
  //output DANGEROUS:
  // {
  //   "success": false,
  //   "message": "connect ECONNREFUSED 127.0.0.1:27017"
  // }
  // Unknown — don't leak internals
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorHandler;
