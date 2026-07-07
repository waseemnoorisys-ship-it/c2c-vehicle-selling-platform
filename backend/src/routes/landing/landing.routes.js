const express = require("express");
const router = express.Router();
const { getLandingData } = require("../../controllers/landing/landing.controller");

router.post("/data", getLandingData);

module.exports = router;