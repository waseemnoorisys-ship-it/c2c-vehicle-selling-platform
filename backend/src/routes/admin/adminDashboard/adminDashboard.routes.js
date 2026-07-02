const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../../../controllers/admin/adminDashboard/adminDashboard.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")

router.post("/stats", authenticateAdmin, getDashboardStats);

module.exports = router;