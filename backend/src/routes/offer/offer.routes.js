const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/offer/offer.controller");
const validate   = require("../../middleware/validate.middleware");
const { authenticate, requireRole } = require("../../middleware/auth.middleware");
const {
  createOfferSchema,
  acceptOfferSchema,
  rejectOfferSchema,
  getOfferSchema,
  receivedOffersSchema,
} = require("../../validators/offer/offer.validators");

// ── Buyer ──────────────────────────────────────────────────────────
router.post("/create",   authenticate, requireRole("buyer"),  validate(createOfferSchema),   controller.createOffer);
router.post("/mine",     authenticate, requireRole("buyer"),  controller.getMyOffers);

// ── Vendor ─────────────────────────────────────────────────────────
router.post("/received", authenticate, requireRole("vendor"), validate(receivedOffersSchema), controller.getReceivedOffers);
router.post("/accept",   authenticate, requireRole("vendor"), validate(acceptOfferSchema),    controller.acceptOffer);
router.post("/reject",   authenticate, requireRole("vendor"), validate(rejectOfferSchema),    controller.rejectOffer);

// ── Shared (buyer + vendor) ────────────────────────────────────────
router.post("/get",      authenticate,                        validate(getOfferSchema),       controller.getOffer);

module.exports = router;    