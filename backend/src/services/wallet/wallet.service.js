const Wallet = require("../../models/wallet/wallet.model");
const WalletLedger = require("../../models/walletLedger/walletLedger.model");

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

async function createLedgerEntry(data) {
  return WalletLedger.create(data);
}

module.exports = {
  findWalletByUserId,
  findOrCreateWallet,
  creditWallet,
  createLedgerEntry,
};