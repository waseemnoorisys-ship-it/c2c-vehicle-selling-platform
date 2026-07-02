const CommissionConfig = require("../../../models/commission/commission.model");

async function getCommissionConfig() {
  return CommissionConfig.findOne({});
}

async function upsertCommissionConfig(percentage, adminId) {
  return CommissionConfig.findOneAndUpdate(
    {},
    { percentage, updatedBy: adminId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

module.exports = { getCommissionConfig, upsertCommissionConfig };