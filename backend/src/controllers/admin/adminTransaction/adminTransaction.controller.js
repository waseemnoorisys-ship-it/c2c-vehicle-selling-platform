const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminTransactionService = require("../../../services/admin/adminTransaction/adminTransaction.service");
const {
  listTransactionsSchema,
  transactionIdSchema,
} = require("../../../validators/admin/adminTransaction/adminTransaction.validators");

const listTransactions = async (req, res, next) => {
  try {
    const { error, value } = listTransactionsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, status, fromDate, toDate, buyerId, vendorId } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (buyerId) filter.buyerId = buyerId;
    if (vendorId) filter.vendorId = vendorId;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const [transactions, total] = await Promise.all([
      adminTransactionService.findAllTransactions(filter, skip, limit),
      adminTransactionService.countTransactions(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        { transactions, total, page, limit },
        "Transactions fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const { error, value } = transactionIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const transaction = await adminTransactionService.findTransactionById(
      value.transactionId
    );
    if (!transaction) throw new ApiError(404, "Transaction not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { transaction }, "Transaction fetched"));
  } catch (err) {
    next(err);
  }
};

module.exports = { listTransactions, getTransaction };