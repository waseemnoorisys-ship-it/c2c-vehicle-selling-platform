const userService = require("../../services/user/user.service");
const ApiResponse  = require("../../utils/ApiResponse");
const ApiError     = require("../../utils/ApiError");

// WHY this controller is so simple: req.user already exists thanks to
// auth.middleware (Sprint 1). No extra DB call needed for "get my profile".
const getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user));
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
  } catch (err) { next(err); }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No photo file provided");
    const result = await userService.updateProfilePhoto(req.user._id, req.file);
    res.status(200).json(new ApiResponse(200, result, "Profile photo updated"));
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, uploadPhoto };