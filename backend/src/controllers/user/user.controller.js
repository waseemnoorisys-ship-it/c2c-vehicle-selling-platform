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
    //bug
    // await userService.updateUserById(req.user._id, {
    //   fcmToken: value.fcmToken,
    // });

    //fix
    await userService.findByIdAndUpdate(req.user._id, { fcmToken: value.fcmToken });
    return res.status(200).json(new ApiResponse(200, {}, t("success.user.fcmSaved", lang)));
  } catch (err) {
    next(err);
  }
};
module.exports = { getMe, updateMe, uploadPhoto, saveFcmToken };
