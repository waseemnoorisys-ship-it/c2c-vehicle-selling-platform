const multer = require("multer");
const ApiError = require("../utils/ApiError");
const { t } = require("../utils/i18n");
const { getLang } = require("../utils/getLang");

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    //cb means callback
    //[no error(null) , true]
    //[error [full],false]
    cb(null, true);
  } else {
    cb(
      new ApiError(400, t("errors.common.invalidImageType", getLang(req))),
      false,
    );
  }
}

const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("photo");

const uploadListingPhotos = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("photos", 10);

function handleProfilePhotoUpload(req, res, next) {
  uploadProfilePhoto(req, res, (err) => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}

function handleListingPhotosUpload(req, res, next) {
  uploadListingPhotos(req, res, (err) => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}

//voice messages for upload a voice message file like audio.mp3 , webma etc
//filter function that filters the types === these types if yes call the next function uploadChatMedia [HELPER FUNCTIOn]
function chatMediaFileFilter(req, file, cb) {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",

    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // Audio
    "audio/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/wav",

    // PDF
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Unsupported chat file type"), false);
  }
}

//this function is to upload a voice message file for only single file with limit of 25mb . after multer [binary ---> mime type]
const uploadChatMedia = multer({
  storage,
  fileFilter: chatMediaFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
}).single("file");

//this is the final function that give the named audio file and this file is added on form data if we call the upload-image api
function handleChatMediaUpload(req, res, next) {
  uploadChatMedia(req, res, (err) => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}

module.exports = { handleProfilePhotoUpload, handleListingPhotosUpload ,handleChatMediaUpload,};
