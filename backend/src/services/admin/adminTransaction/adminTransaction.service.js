const Transaction = require("../../../models/transaction/transaction.model");

async function findAllTransactions(filter, skip, limit) {
  return Transaction.find(filter)
    .populate("buyerId", "firstName lastName email")
    .populate("vendorId", "firstName lastName email")
    .populate("listingId", "registrationNumber year")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countTransactions(filter) {
  return Transaction.countDocuments(filter);
}

async function findTransactionById(id) {
  return Transaction.findOne({ _id: id, deletedAt: null })
    .populate("buyerId", "firstName lastName email")
    .populate("vendorId", "firstName lastName email")
    .populate("listingId", "registrationNumber year askingPrice displayPrice")
    .populate("offerId");
}

module.exports = {
  findAllTransactions,
  countTransactions,
  findTransactionById,
};