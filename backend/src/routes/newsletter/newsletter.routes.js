const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validate.middleware");
const {
  subscribeSchema,
  unsubscribeSchema,
} = require("../../validators/newsletter/newsletter.validators");
const newsletterController = require("../../controllers/newsletter/newsletter.controller");

router.post(
  "/subscribe",
  validate(subscribeSchema),
  newsletterController.subscribe
);

router.post(
  "/unsubscribe",
  validate(unsubscribeSchema),
  newsletterController.unsubscribe
);

module.exports = router;
