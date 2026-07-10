const express = require("express");
const router = express.Router();
const { getLandingData, getSearchFilters } = require("../../controllers/landing/landing.controller");

router.post("/data", getLandingData);
router.post("/search-filters", getSearchFilters);

module.exports = router;