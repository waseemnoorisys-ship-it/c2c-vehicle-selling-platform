const Withdrawal = require("../../../models/withdrawal/withdrawal.model");

async function findAllWithdrawals(filter, skip, limit) {
  return Withdrawal.find(filter)
    .populate("userId", "firstName lastName email")
    .populate("bankDetailsId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countWithdrawals(filter) {
  return Withdrawal.countDocuments(filter);
}

async function findWithdrawalById(id) {
  return Withdrawal.findOne({ _id: id, deletedAt: null })
    .populate("userId", "firstName lastName email")
    .populate("bankDetailsId")
    .populate("walletId");
}

async function updateWithdrawalById(id, update) {
  return Withdrawal.findByIdAndUpdate(id, update, { new: true });
}

module.exports = {
  findAllWithdrawals,
  countWithdrawals,
  findWithdrawalById,
  updateWithdrawalById,
};