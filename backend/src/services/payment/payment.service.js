const Transaction = require("../../models/transaction/transaction.model");

async function createTransaction(data) {
  return Transaction.create(data);
}

async function findTransactionById(id) {
  return Transaction.findOne({ _id: id, deletedAt: null });
}

async function findTransactionByOfferId(offerId) {
  return Transaction.findOne({ offerId, deletedAt: null });
}

async function findTransactionByIntentId(stripePaymentIntentId) {
  return Transaction.findOne({ stripePaymentIntentId, deletedAt: null });
}

async function updateTransactionById(id, update) {
  return Transaction.findByIdAndUpdate(id, update, { new: true });
}

module.exports = {
  createTransaction,
  findTransactionById,
  findTransactionByOfferId,
  findTransactionByIntentId,
  updateTransactionById,
};