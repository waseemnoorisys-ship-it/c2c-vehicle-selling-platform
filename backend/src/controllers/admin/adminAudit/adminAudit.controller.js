const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminAuditService = require("../../../services/admin/adminAudit/adminAudit.service");
const Joi = require("joi");
const { t } = require("../../../utils/i18n");
const { getLang } = require("../../../utils/getLang");

const listAuditLogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  adminId: Joi.string().hex().length(24).optional(),
  action: Joi.string().optional(),
  resource: Joi.string().optional(),
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
});

const listAuditLogs = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listAuditLogsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, adminId, action, resource, fromDate, toDate } = value;
    const skip = (page - 1) * limit;

    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = { $regex: action, $options: "i" };
    if (resource) filter.resource = resource;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const [logs, total] = await Promise.all([
      adminAuditService.findAllAuditLogs(filter, skip, limit),
      adminAuditService.countAuditLogs(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { logs, total, page, limit }, t("success.admin.auditFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { listAuditLogs };
