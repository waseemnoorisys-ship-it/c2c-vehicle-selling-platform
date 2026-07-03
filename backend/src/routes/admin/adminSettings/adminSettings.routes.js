const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../../../controllers/admin/adminSettings/adminSettings.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")

router.post("/get", authenticateAdmin, getSettings);
router.post("/update", authenticateAdmin, updateSettings);

module.exports = router;