const ApiError = require("../utils/ApiError");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = source === "query" ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const lang = getLang(req);
      const messages = error.details.map((d) => d.message);
      return next(new ApiError(400, t("errors.common.validationFailed", lang), messages));
    }

    if (source === "query") {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
}

module.exports = validate;
