const express = require("express");
const router = express.Router();
const {
  listListings,
  getListing,
  approveListing,
  rejectListing,
  toggleVerified,
} = require("../../../controllers/admin/adminListing/adminListing.controller");
const { authenticateAdmin } = require("../../../middleware/adminAuthMiddleware");

router.post("/list", authenticateAdmin, listListings);
router.post("/get", authenticateAdmin, getListing);
router.post("/approve", authenticateAdmin, approveListing);
router.post("/reject", authenticateAdmin, rejectListing);
router.post("/toggle-verified", authenticateAdmin, toggleVerified);

module.exports = router;