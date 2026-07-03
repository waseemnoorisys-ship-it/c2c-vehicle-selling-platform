const express = require("express");
const router = express.Router();
const {
  listTransactions,
  getTransaction,
} = require("../../../controllers/admin/adminTransaction/adminTransaction.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")

router.post("/list", authenticateAdmin, listTransactions);
router.post("/get", authenticateAdmin, getTransaction);

module.exports = router;