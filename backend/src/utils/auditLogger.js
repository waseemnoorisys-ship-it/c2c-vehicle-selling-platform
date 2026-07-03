const AuditLog = require("../models/auditLog/auditLog.model");
const logger = require("../config/logger");

async function createAuditLog({ adminId, action, resource, resourceId, meta }) {
  try {
    await AuditLog.create({
      adminId,
      action,
      resource,
      resourceId: resourceId || null,
      meta: meta || {},
    });
  } catch (err) {
    logger.error("Audit log write failed", { action, resource, resourceId, err });
  }
}

module.exports = { createAuditLog };