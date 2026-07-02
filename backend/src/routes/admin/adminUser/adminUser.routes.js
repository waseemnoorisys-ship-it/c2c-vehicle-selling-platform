const express = require("express");
const router = express.Router();
const {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  deleteUser,
} = require("../../../controllers/admin/adminUser/adminUser.controller");
const { authenticateAdmin } = require("../../../middleware/adminAuthMiddleware");

router.post("/list", authenticateAdmin, listUsers);
router.post("/get", authenticateAdmin, getUser);
router.post("/activate", authenticateAdmin, activateUser);
router.post("/deactivate", authenticateAdmin, deactivateUser);
router.post("/delete", authenticateAdmin, deleteUser);

module.exports = router;