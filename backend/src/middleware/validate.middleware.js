const ApiError = require("../utils/ApiError");

// WHY factory: pass a Joi schema, get back a middleware.
// Keeps controllers clean — no validation code inside them.
// WHY source param added in Sprint 3:
// browseListings validates req.query not req.body.
// Passing source = "query" lets the same factory handle both cases.
// Default is "body" so all Sprint 1 + 2 routes work without any changes.
function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = source === "query" ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,  // WHY: collect ALL errors not just first one
      stripUnknown: true, // WHY: silently remove fields not in schema (security)
      convert: true,      // WHY: "20" string → 20 number for query params
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ApiError(400, "Validation failed", messages));
    }

    // WHY write validated value back to req:
    // Joi may have applied defaults (e.g. page=1, limit=20) and type
    // conversions. We want the rest of the chain to use the clean value.
    if (source === "query") {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
}

module.exports = validate;