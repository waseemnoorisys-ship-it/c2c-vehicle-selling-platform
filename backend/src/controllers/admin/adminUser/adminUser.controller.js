const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminUserService = require("../../../services/admin/adminUser/adminUser.service");
const {
  listUsersSchema,
  userIdSchema,
} = require("../../../validators/admin/adminUser/adminUser.validators");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");

const listUsers = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listUsersSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, role, search } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      adminUserService.findAllUsers(filter, skip, limit),
      adminUserService.countUsers(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { users, total, page, limit }, t("success.admin.usersFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, t("errors.user.notFound", lang));

    return res.status(200).json(new ApiResponse(200, { user }, t("success.admin.userFetched", lang)));
  } catch (err) {
    next(err);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, t("errors.user.notFound", lang));

    if (user.isActive) throw new ApiError(400, t("errors.user.alreadyActive", lang));

    await adminUserService.updateUserById(value.userId, { isActive: true });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, t("success.admin.userActivated", lang)));
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, t("errors.user.notFound", lang));

    if (!user.isActive) throw new ApiError(400, t("errors.user.alreadyDeactivated", lang));

    await adminUserService.updateUserById(value.userId, { isActive: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, t("success.admin.userDeactivated", lang)));
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, t("errors.user.notFound", lang));

    if (user.deletedAt) throw new ApiError(400, t("errors.user.alreadyDeleted", lang));

    await adminUserService.updateUserById(value.userId, {
      deletedAt: new Date(),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, t("success.admin.userDeleted", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUser, activateUser, deactivateUser, deleteUser };
