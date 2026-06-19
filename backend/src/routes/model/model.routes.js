const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/model/model.controller");
const validate    = require("../../middleware/validate.middleware");
const { createModelSchema, updateModelSchema } = require("../../validators/model/model.validators");

// Same temporary note as make.routes.js — admin lockdown comes in Sprint 7.

router.get("/", controller.getAllModels);      // public, supports ?makeId=
router.get("/:id", controller.getModelById);   // public

router.post("/", validate(createModelSchema), controller.createModel);
router.patch("/:id", validate(updateModelSchema), controller.updateModel);
router.delete("/:id", controller.deleteModel);

module.exports = router;