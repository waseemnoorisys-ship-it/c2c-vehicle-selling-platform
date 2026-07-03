const AuditLog = require("../../../models/auditLog/auditLog.model");

async function findAllAuditLogs(filter, skip, limit) {
  return AuditLog.find(filter)
    .populate("adminId", "firstName lastName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countAuditLogs(filter) {
  return AuditLog.countDocuments(filter);
}

module.exports = { findAllAuditLogs, countAuditLogs };