const ApiError = require("../utils/ApiError");

// WHY factory: pass a Joi schema, get back a middleware.
// Keeps controllers clean — no validation code inside them.
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ApiError(400, "Validation failed", messages));
    }
    next();
  };
}

module.exports = validate;