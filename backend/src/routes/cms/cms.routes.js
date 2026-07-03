const express = require("express");
const router = express.Router();
const { getPublicPage } = require("../../controllers/cms/cms.controller.js");

router.post("/get", getPublicPage);

module.exports = router;