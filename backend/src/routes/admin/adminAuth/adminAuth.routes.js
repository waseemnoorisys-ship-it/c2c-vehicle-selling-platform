const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminRefreshToken,
  adminLogout,
} = require("../../../controllers/admin/adminAuth/adminAuth.controller");
const { authenticateAdmin } = require("../../../middleware/adminAuthMiddleware");

router.post("/login", adminLogin);
router.post("/refresh-token", adminRefreshToken);
router.post("/logout", authenticateAdmin, adminLogout);

module.exports = router;