const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/master/master.controller");
const validate   = require("../../middleware/validate.middleware");
const { getMasterSchema } = require("../../validators/master/master.validators");

router.post("/list", validate(getMasterSchema), controller.getMaster);

module.exports = router;
