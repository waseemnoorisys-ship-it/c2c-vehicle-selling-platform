const AppSettings = require("../../../models/appSettings/appSettings.model");

async function getSettings() {
  return AppSettings.findOne({});
}

async function upsertSettings(data, adminId) {
  return AppSettings.findOneAndUpdate(
    {},
    { ...data, updatedBy: adminId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

module.exports = { getSettings, upsertSettings };