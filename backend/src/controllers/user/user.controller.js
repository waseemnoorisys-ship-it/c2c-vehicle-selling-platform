const userService = require("../../services/user/user.service");
const { uploadProfilePhoto, deleteFileFromCloudinary } = require("../../services/upload/upload.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const ALLOWED_PROFILE_FIELDS = ["firstName", "lastName", "mobile", "countryCode", "language"];

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user));
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const safeUpdates = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (req.body[field] !== undefined) safeUpdates[field] = req.body[field];
    }

    const updated = await userService.findByIdAndUpdate(req.user._id, safeUpdates);
    if (!updated) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
  } catch (err) { next(err); }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No photo file provided");

    const user = await userService.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    if (user.profilePhotoPublicId) {
      await deleteFileFromCloudinary(user.profilePhotoPublicId);
    }

    const { url, publicId } = await uploadProfilePhoto(
      req.file.buffer,
      req.file.originalname
    );

    user.profilePhoto = url;
    user.profilePhotoPublicId = publicId;
    await userService.save(user);

    res.status(200).json(new ApiResponse(200, { profilePhoto: url }, "Profile photo updated"));
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, uploadPhoto };
