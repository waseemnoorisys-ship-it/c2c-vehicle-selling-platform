const Wallet = require("../../models/wallet/wallet.model");
const WalletLedger = require("../../models/walletLedger/walletLedger.model");
const BankDetails = require("../../models/bankDetails/bankDetails.model");
const Withdrawal = require("../../models/withdrawal/withdrawal.model");

async function findWalletByUserId(userId) {
  return Wallet.findOne({ userId, deletedAt: null });
}

async function findOrCreateWallet(userId, currency) {
  let wallet = await Wallet.findOne({ userId, deletedAt: null });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0, currency });
  }
  return wallet;
}

async function creditWallet(walletId, amount) {
  return Wallet.findByIdAndUpdate(
    walletId,
    { $inc: { balance: amount } },
    { new: true }
  );
}

async function debitWallet(walletId, amount) {
  return Wallet.findByIdAndUpdate(
    walletId,
    { $inc: { balance: -amount } },
    { new: true }
  );
}

async function createLedgerEntry(data) {
  return WalletLedger.create(data);
}

async function findLedgerByUserId(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [entries, total] = await Promise.all([
    WalletLedger.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WalletLedger.countDocuments({ userId }),
  ]);
  return { entries, total };
}

async function upsertBankDetails(userId, data) {
  return BankDetails.findOneAndUpdate(
    { userId, deletedAt: null },
    { ...data, userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function findBankDetailsByUserId(userId) {
  return BankDetails.findOne({ userId, deletedAt: null });
}

async function findBankDetailsById(id) {
  return BankDetails.findOne({ _id: id, deletedAt: null });
}

async function createWithdrawal(data) {
  return Withdrawal.create(data);
}

async function findWithdrawalById(id) {
  return Withdrawal.findOne({ _id: id, deletedAt: null });
}

async function findWithdrawalsByUserId(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [withdrawals, total] = await Promise.all([
    Withdrawal.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Withdrawal.countDocuments({ userId, deletedAt: null }),
  ]);
  return { withdrawals, total };
}

module.exports = {
  findWalletByUserId,
  findOrCreateWallet,
  creditWallet,
  debitWallet,
  createLedgerEntry,
  findLedgerByUserId,
  upsertBankDetails,
  findBankDetailsByUserId,
  findBankDetailsById,
  createWithdrawal,
  findWithdrawalById,
  findWithdrawalsByUserId,
};