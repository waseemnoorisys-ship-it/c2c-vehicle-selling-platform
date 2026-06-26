const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/notification/notification.controller");
const validate   = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  getNotificationsSchema,
  readNotificationSchema,
} = require("../../validators/notification/notification.validators");

router.post("/mine",     authenticate, validate(getNotificationsSchema),  controller.getMyNotifications);
router.post("/read",     authenticate, validate(readNotificationSchema),   controller.markAsRead);
router.post("/read-all", authenticate,                                     controller.markAllAsRead);

module.exports = router;