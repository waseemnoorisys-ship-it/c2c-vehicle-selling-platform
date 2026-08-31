const express = require("express");
const { buildUcpProfile } = require("../../ucp/ucp.profile");
const {
  searchCatalog,
  lookupCatalog,
  getProduct,
} = require("../../controllers/ucp/catalog.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  createCheckout,
  getCheckout,
  updateCheckout,
  completeCheckout,
  cancelCheckout,
} = require("../../controllers/ucp/checkout.controller");
const { getOrder } = require("../../controllers/ucp/order.controller");

const router = express.Router();

router.get("/.well-known/ucp", (_req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.json(buildUcpProfile());
});

router.use("/ucp/v1", (req, res, next) => {
  if (!req.get("UCP-Agent")) {
    return res.status(400).json({
      code: "missing_ucp_agent",
      content: "UCP-Agent header is required",
    });
  }
  next();
});

router.post("/ucp/v1/catalog/search", searchCatalog);
router.post("/ucp/v1/catalog/lookup", lookupCatalog);
router.post("/ucp/v1/catalog/product", getProduct);

router.use("/ucp/v1/checkout-sessions", authenticate);
router.post("/ucp/v1/checkout-sessions", createCheckout);
router.get("/ucp/v1/checkout-sessions/:id", getCheckout);
router.put("/ucp/v1/checkout-sessions/:id", updateCheckout);
router.post("/ucp/v1/checkout-sessions/:id/complete", completeCheckout);
router.post("/ucp/v1/checkout-sessions/:id/cancel", cancelCheckout);

router.use("/ucp/v1/orders", authenticate);
router.get("/ucp/v1/orders/:id", getOrder);

module.exports = router;