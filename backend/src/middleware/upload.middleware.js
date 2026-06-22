const multer  = require("multer");
const ApiError = require("../utils/ApiError");

// WHY memoryStorage (same reason as before):
// We don't save to disk. File lives in RAM as a buffer,
// then goes straight to Cloudinary. No temp files on server.
const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, and WEBP images are allowed"), false);
  }
}

const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

module.exports = { handleProfilePhotoUpload, handleListingPhotosUpload };