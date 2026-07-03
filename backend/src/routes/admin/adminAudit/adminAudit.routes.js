const express = require("express");
const router = express.Router();
const { listAuditLogs } = require("../../../controllers/admin/adminAudit/adminAudit.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")

router.post("/list", authenticateAdmin, listAuditLogs);

module.exports = router;