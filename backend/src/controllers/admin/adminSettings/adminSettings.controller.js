const ApiResponse = require("../../../utils/ApiResponse");
const ApiError = require("../../../utils/ApiError");
const adminSettingsService = require("../../../services/admin/adminSettings/adminSettings.service");
const { createAuditLog } = require("../../../utils/auditLogger");
const { updateSettingsSchema } = require("../../../validators/admin/adminSettings/adminSettings.validators");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");

const getSettings = async (req, res, next) => {
  try {
    const lang = getLang(req);
    let settings = await adminSettingsService.getSettings();
    if (!settings) {
      settings = await adminSettingsService.upsertSettings({}, null);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { settings }, t("success.admin.settingsFetched", lang)));
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
      .json(new ApiResponse(200, { settings }, t("success.admin.settingsUpdated", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
