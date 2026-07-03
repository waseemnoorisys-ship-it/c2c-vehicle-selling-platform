const express = require("express");
const router = express.Router();
const {
  listWithdrawals,
  getWithdrawal,
  approveWithdrawal,
  markWithdrawalPaid,
  rejectWithdrawal,
} = require("../../../controllers/admin/adminWithdrawal/adminWithdrawal.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")
router.post("/list", authenticateAdmin, listWithdrawals);
router.post("/get", authenticateAdmin, getWithdrawal);
router.post("/approve", authenticateAdmin, approveWithdrawal);
router.post("/mark-paid", authenticateAdmin, markWithdrawalPaid);
router.post("/reject", authenticateAdmin, rejectWithdrawal);

module.exports = router;