const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/user/user.controller");
const validate   = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { handleProfilePhotoUpload } = require("../../middleware/upload.middleware");
const { updateProfileSchema } = require("../../validators/user/user.validators");

router.use(authenticate);

router.post("/me", controller.getMe);
router.post("/update", validate(updateProfileSchema), controller.updateMe);
router.post("/photo", handleProfilePhotoUpload, controller.uploadPhoto);

module.exports = router;
