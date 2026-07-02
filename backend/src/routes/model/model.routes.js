const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/model/model.controller");
const validate   = require("../../middleware/validate.middleware");
const {
  listModelsSchema,
  getModelByIdSchema,
  createModelSchema,
  updateModelSchema,
  deleteModelSchema,
} = require("../../validators/model/model.validators");
const {authenticateAdmin} = require("../../middleware/adminAuthMiddleware")

router.post("/list", authenticateAdmin, validate(listModelsSchema), controller.getAllModels);
router.post("/get", authenticateAdmin, validate(getModelByIdSchema), controller.getModelById);
router.post("/create", authenticateAdmin, validate(createModelSchema), controller.createModel);
router.post("/update", authenticateAdmin, validate(updateModelSchema), controller.updateModel);
router.post("/delete", authenticateAdmin, validate(deleteModelSchema), controller.deleteModel);

module.exports = router;
