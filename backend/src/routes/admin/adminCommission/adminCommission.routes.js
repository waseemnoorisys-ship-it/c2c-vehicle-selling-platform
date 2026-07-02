const express = require("express");
const router = express.Router();
const {
  getCommission,
  updateCommission,
} = require("../../../controllers/admin/adminCommission/adminCommission.controller");
const { authenticateAdmin } = require("../../../middleware/adminAuthMiddleware");

router.post("/get", authenticateAdmin, getCommission);
router.post("/update", authenticateAdmin, updateCommission);

module.exports = router;