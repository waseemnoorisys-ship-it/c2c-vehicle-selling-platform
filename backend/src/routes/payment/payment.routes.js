const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  redirectToStripeCheckout,
  handleWebhook,
  confirmDelivery,
  getTransaction,
} = require("../../controllers/payment/payment.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.post("/create-intent", authenticate, createPaymentIntent);
// Stripe Checkout Redirect (for MCP)
router.get("/checkout/:transactionId", redirectToStripeCheckout);
router.post("/webhook", handleWebhook);
router.post("/confirm-delivery", authenticate, confirmDelivery);
router.post("/transaction/get", authenticate, getTransaction);

module.exports = router;