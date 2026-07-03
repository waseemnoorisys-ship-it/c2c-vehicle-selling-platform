const ApiResponse = require("../../../utils/ApiResponse");
const ApiError = require("../../../utils/ApiError");
const adminSettingsService = require("../../../services/admin/adminSettings/adminSettings.service");
const { createAuditLog } = require("../../../utils/auditLogger");
const { updateSettingsSchema } = require("../../../validators/admin/adminSettings/adminSettings.validators");

const getSettings = async (req, res, next) => {
  try {
    let settings = await adminSettingsService.getSettings();
    if (!settings) {
      settings = await adminSettingsService.upsertSettings({}, null);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { settings }, "Settings fetched"));
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { error, value } = updateSettingsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const settings = await adminSettingsService.upsertSettings(value, req.admin._id);

    await createAuditLog({
      adminId: req.admin._id,
      action: "UPDATE_APP_SETTINGS",
      resource: "AppSettings",
      resourceId: settings._id,
      meta: { updates: value },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { settings }, "Settings updated successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };