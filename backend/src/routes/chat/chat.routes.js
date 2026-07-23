const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createOrGetConversation,
  getConversation,
  myConversations,
  getMessages,
  // uploadChatImage,
  uploadChatMedia,
  editMessage,
  deleteMessage,
  blockUser,
  unblockUser,
  reportConversation,
} = require("../../controllers/chat/chat.controller");
const {
  authenticate,
} = require("../../middleware/auth.middleware");
const {handleChatMediaUpload} = require("../../middleware/upload.middleware");
const storage = multer.memoryStorage();
//old
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files allowed"), false);
//     }
//   },
// });

router.post("/conversations/create", authenticate, createOrGetConversation);
router.post("/conversations/get", authenticate, getConversation);
router.post("/conversations/mine", authenticate, myConversations);
router.post("/messages/list", authenticate, getMessages);
//upload that is old filter function
// router.post(
//   "/messages/upload-media",
//   authenticate,
//   upload.single("file"),
//   uploadChatMedia
// );

//voice message + image upload
router.post(
  "/messages/upload-media",
  authenticate,
  handleChatMediaUpload,
  uploadChatMedia,
);
router.post("/messages/edit", authenticate, editMessage);
router.post("/messages/delete", authenticate, deleteMessage);
router.post("/block/create", authenticate, blockUser);
router.post("/block/remove", authenticate, unblockUser);
router.post("/report", authenticate, reportConversation);

module.exports = router;
