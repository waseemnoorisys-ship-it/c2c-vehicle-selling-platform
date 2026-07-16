const express = require("express");
const router = express.Router();
const {
  listAllConversations,
  getConversationMessages,
  listReports,
  reviewReport,
  closeConversation,
} = require("../../../controllers/admin/adminChat/adminChat.controller");
const { authenticateAdmin } = require("../../../middleware/adminAuthMiddleware");

router.post("/conversations/list", authenticateAdmin, listAllConversations);
router.post("/conversations/messages", authenticateAdmin, getConversationMessages);
router.post("/conversations/close", authenticateAdmin, closeConversation);
router.post("/reports/list", authenticateAdmin, listReports);
router.post("/reports/review", authenticateAdmin, reviewReport);

module.exports = router;