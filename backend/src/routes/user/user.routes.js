const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/user/user.controller");
const validate    = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { handleProfilePhotoUpload } = require("../../middleware/upload.middleware");
const { updateProfileSchema } = require("../../validators/user/user.validators");

// WHY router.use(authenticate) here: EVERY route in this file requires
// login. Applying it once at the top avoids repeating it on each line.
router.use(authenticate);

router.get("/me", controller.getMe);
router.patch("/me", validate(updateProfileSchema), controller.updateMe);
router.post("/me/photo", handleProfilePhotoUpload, controller.uploadPhoto);

module.exports = router;