const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/offer/offer.controller");
const validate   = require("../../middleware/validate.middleware");
const { authenticate, requireRole } = require("../../middleware/auth.middleware");
const { createOfferSchema, getMyOffersSchema } = require("../../validators/offer/offer.validators");

router.use(authenticate, requireRole("buyer"));

router.post("/mine", validate(getMyOffersSchema), controller.getMyOffers);
router.post("/create", validate(createOfferSchema), controller.createOffer);

module.exports = router;
