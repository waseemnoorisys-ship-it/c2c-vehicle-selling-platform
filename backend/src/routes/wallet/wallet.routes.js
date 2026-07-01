const express = require("express");
const router = express.Router();
const {
  getWallet,
  getLedger,
  createBankDetails,
  getBankDetails,
  createWithdrawal,
  myWithdrawals,
  getWithdrawal,
  getInvoice,
} = require("../../controllers/wallet/wallet.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.post("/get", authenticate, getWallet);
router.post("/ledger", authenticate, getLedger);

router.post("/bank-details/create", authenticate, createBankDetails);
router.post("/bank-details/get", authenticate, getBankDetails);

router.post("/withdrawals/create", authenticate, createWithdrawal);
router.post("/withdrawals/mine", authenticate, myWithdrawals);
router.post("/withdrawals/get", authenticate, getWithdrawal);

router.post("/invoices/get", authenticate, getInvoice);

module.exports = router;