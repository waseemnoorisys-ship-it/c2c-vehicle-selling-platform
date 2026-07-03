const express = require("express");
const router = express.Router();
const {
  createPage,
  updatePage,
  listPages,
  getPage,
  deletePage,
} = require("../../../controllers/admin/adminCms/adminCms.controller");
const {authenticateAdmin} = require("../../../middleware/adminAuthMiddleware")

router.post("/create", authenticateAdmin, createPage);
router.post("/update", authenticateAdmin, updatePage);
router.post("/list", authenticateAdmin, listPages);
router.post("/get", authenticateAdmin, getPage);
router.post("/delete", authenticateAdmin, deletePage);

module.exports = router;