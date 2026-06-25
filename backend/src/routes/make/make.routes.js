const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/make/make.controller");
const validate   = require("../../middleware/validate.middleware");
const {
  listMakesSchema,
  getMakeByIdSchema,
  createMakeSchema,
  updateMakeSchema,
  deleteMakeSchema,
} = require("../../validators/make/make.validators");

router.post("/list", validate(listMakesSchema), controller.getAllMakes);
router.post("/get", validate(getMakeByIdSchema), controller.getMakeById);
router.post("/create", validate(createMakeSchema), controller.createMake);
router.post("/update", validate(updateMakeSchema), controller.updateMake);
router.post("/delete", validate(deleteMakeSchema), controller.deleteMake);

module.exports = router;
