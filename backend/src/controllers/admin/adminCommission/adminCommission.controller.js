const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminCommissionService = require("../../../services/admin/adminCommission/adminCommission.service");
const { updateCommissionSchema } = require("../../../validators/admin/adminCommission/adminCommission.validators");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");

const getCommission = async (req, res, next) => {
  try {
    const lang = getLang(req);
    let config = await adminCommissionService.getCommissionConfig();

    if (!config) {
      config = await adminCommissionService.upsertCommissionConfig(5, null);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { config }, t("success.admin.commissionFetched", lang)));
  } catch (err) {
    next(err);
  }
};

const updateCommission = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = updateCommissionSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const config = await adminCommissionService.upsertCommissionConfig(
      value.percentage,
      req.admin._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { config }, t("success.admin.commissionUpdated", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { getCommission, updateCommission };
