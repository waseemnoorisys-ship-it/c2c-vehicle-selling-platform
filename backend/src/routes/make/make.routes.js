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
const {authenticateAdmin} = require("../../middleware/adminAuthMiddleware")

router.post("/list", authenticateAdmin,   validate(listMakesSchema), controller.getAllMakes);
router.post("/get", authenticateAdmin, validate(getMakeByIdSchema), controller.getMakeById);
router.post("/create", authenticateAdmin, validate(createMakeSchema), controller.createMake);
router.post("/update", authenticateAdmin, validate(updateMakeSchema), controller.updateMake);
router.post("/delete", authenticateAdmin, validate(deleteMakeSchema), controller.deleteMake);

module.exports = router;
