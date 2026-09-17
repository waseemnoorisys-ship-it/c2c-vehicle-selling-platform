const userService = require("../../services/user/user.service");
const {
  uploadProfilePhoto,
  deleteFileFromCloudinary,
} = require("../../services/upload/upload.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");
const Joi = require("joi");

const ALLOWED_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "mobile",
  "countryCode",
  "language",
];

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user));
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const safeUpdates = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (req.body[field] !== undefined) safeUpdates[field] = req.body[field];
    }

    const updated = await userService.findByIdAndUpdate(
      req.user._id,
      safeUpdates,
    );
    if (!updated) throw new ApiError(404, t("errors.user.notFound", lang));

    res.status(200).json(new ApiResponse(200, updated, t("success.user.profileUpdated", lang)));
  } catch (err) {
    next(err);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    const lang = getLang(req);
    if (!req.file) throw new ApiError(400, t("errors.user.noPhoto", lang));

    const user = await userService.findById(req.user._id);
    if (!user) throw new ApiError(404, t("errors.user.notFound", lang));

    if (user.profilePhotoPublicId) {
      await deleteFileFromCloudinary(user.profilePhotoPublicId);
    }

    const { url, publicId } = await uploadProfilePhoto(
      req.file.buffer,
      req.file.originalname,
    );

    user.profilePhoto = url;
    user.profilePhotoPublicId = publicId;
    await userService.save(user);

    res
      .status(200)
      .json(
        new ApiResponse(200, { profilePhoto: url }, t("success.user.photoUploaded", lang)),
      );
  } catch (err) {
    next(err);
  }
};
//sprint 9 fcm token
const saveFcmToken = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const schema = Joi.object({
      fcmToken: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    await userService.findByIdAndUpdate(req.user._id, { fcmToken: value.fcmToken });
    return res.status(200).json(new ApiResponse(200, {}, t("success.user.fcmSaved", lang)));
  } catch (err) {
    next(err);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId) throw new ApiError(400, "Listing ID is required");

    const user = await userService.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const saved = user.savedVehicles || [];
    const index = saved.findIndex((id) => id.toString() === listingId.toString());

    let isSaved = false;
    if (index > -1) {
      saved.splice(index, 1);
      isSaved = false;
    } else {
      saved.push(listingId);
      isSaved = true;
    }

    user.savedVehicles = saved;
    await userService.save(user);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { savedVehicles: user.savedVehicles, isSaved },
          isSaved ? "Listing added to saved vehicles" : "Listing removed from saved vehicles"
        )
      );
  } catch (err) {
    next(err);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const User = require("../../models/user/user.model");
    const user = await User.findById(req.user._id).populate({
      path: "savedVehicles",
      populate: [
        { path: "makeId", select: "name code logoUrl" },
        { path: "modelId", select: "name bodyType" },
        { path: "vendorId", select: "firstName lastName email profilePhoto mobile" },
      ],
    });

    if (!user) throw new ApiError(404, "User not found");

    const listings = (user.savedVehicles || []).filter((l) => l && l.status !== "deleted");

    return res
      .status(200)
      .json(new ApiResponse(200, listings, "Saved vehicles retrieved successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  uploadPhoto,
  saveFcmToken,
  toggleFavorite,
  getFavorites,
};
