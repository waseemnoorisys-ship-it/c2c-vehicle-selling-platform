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

router.post("/list", validate(listModelsSchema), controller.getAllModels);
router.post("/get", validate(getModelByIdSchema), controller.getModelById);
router.post("/create", validate(createModelSchema), controller.createModel);
router.post("/update", validate(updateModelSchema), controller.updateModel);
router.post("/delete", validate(deleteModelSchema), controller.deleteModel);

module.exports = router;
