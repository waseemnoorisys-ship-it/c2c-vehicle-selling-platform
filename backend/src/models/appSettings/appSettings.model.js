const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "C2C Vehicles",
    },
    supportEmail: {
      type: String,
      default: "support@c2cvehicles.com",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    contactAddress: {
      type: String,
      default: "",
    },
    maxPhotosPerListing: {
      type: Number,
      default: 10,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppSettings", appSettingsSchema);