const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminUserService = require("../../../services/admin/adminUser/adminUser.service");
const {
  listUsersSchema,
  userIdSchema,
} = require("../../../validators/admin/adminUser/adminUser.validators");

const listUsers = async (req, res, next) => {
  try {
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
      new ApiResponse(200, { users, total, page, limit }, "Users fetched")
    );
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, { user }, "User fetched"));
  } catch (err) {
    next(err);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.isActive) throw new ApiError(400, "User is already active");

    await adminUserService.updateUserById(value.userId, { isActive: true });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User activated successfully"));
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!user.isActive) throw new ApiError(400, "User is already deactivated");

    await adminUserService.updateUserById(value.userId, { isActive: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User deactivated successfully"));
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await adminUserService.findUserById(value.userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.deletedAt) throw new ApiError(400, "User already deleted");

    await adminUserService.updateUserById(value.userId, {
      deletedAt: new Date(),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User deleted successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUser, activateUser, deactivateUser, deleteUser };