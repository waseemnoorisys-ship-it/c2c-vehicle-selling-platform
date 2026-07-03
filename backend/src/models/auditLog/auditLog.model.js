const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);