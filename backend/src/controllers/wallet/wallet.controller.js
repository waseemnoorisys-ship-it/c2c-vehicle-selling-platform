const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const {
  createBankDetailsSchema,
  createWithdrawalSchema,
  getWithdrawalSchema,
  listSchema,
  getInvoiceSchema,
} = require("../../validators/wallet/wallet.validators");
const walletService = require("../../services/wallet/wallet.service");
const invoiceService = require("../../services/invoice/invoice.service");
const paymentService = require("../../services/payment/payment.service");
const { encrypt, decrypt, maskAccountNumber } = require("../../utils/encryption");

const getWallet = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const wallet = await walletService.findOrCreateWallet(userId, "usd");
    return res.status(200).json(new ApiResponse(200, { wallet }, "Wallet fetched"));
  } catch (err) {
    next(err);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const { error, value } = listSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit } = value;
    const userId = req.user._id;

    const { entries, total } = await walletService.findLedgerByUserId(userId, page, limit);

    return res.status(200).json(
      new ApiResponse(200, { entries, total, page, limit }, "Ledger fetched")
    );
  } catch (err) {
    next(err);
  }
};

const createBankDetails = async (req, res, next) => {
  try {
    const { error, value } = createBankDetailsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const userId = req.user._id;
    const { accountHolderName, accountNumber, ifscOrRouting, bankName } = value;

    const bankDetails = await walletService.upsertBankDetails(userId, {
      accountHolderName,
      accountNumberEncrypted: encrypt(accountNumber),
      ifscOrRoutingEncrypted: encrypt(ifscOrRouting),
      bankName,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bankDetails: {
            _id: bankDetails._id,
            accountHolderName: bankDetails.accountHolderName,
            bankName: bankDetails.bankName,
            accountNumberMasked: maskAccountNumber(accountNumber),
          },
        },
        "Bank details saved"
      )
    );
  } catch (err) {
    next(err);
  }
};

const getBankDetails = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const bankDetails = await walletService.findBankDetailsByUserId(userId);
    if (!bankDetails) throw new ApiError(404, "No bank details found");

    const decryptedAccount = decrypt(bankDetails.accountNumberEncrypted);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bankDetails: {
            _id: bankDetails._id,
            accountHolderName: bankDetails.accountHolderName,
            bankName: bankDetails.bankName,
            accountNumberMasked: maskAccountNumber(decryptedAccount),
          },
        },
        "Bank details fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

const createWithdrawal = async (req, res, next) => {
  try {
    const { error, value } = createWithdrawalSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { amount } = value;
    const userId = req.user._id;

    const bankDetails = await walletService.findBankDetailsByUserId(userId);
    if (!bankDetails) {
      throw new ApiError(400, "Add bank details before requesting a withdrawal");
    }

    const wallet = await walletService.findOrCreateWallet(userId, "usd");

    if (amount > wallet.balance) {
      throw new ApiError(400, "Withdrawal amount exceeds wallet balance");
    }

    const updatedWallet = await walletService.debitWallet(wallet._id, amount);

    const withdrawal = await walletService.createWithdrawal({
      userId,
      walletId: wallet._id,
      bankDetailsId: bankDetails._id,
      amount,
      currency: wallet.currency,
      status: "pending",
    });

    await walletService.createLedgerEntry({
      walletId: wallet._id,
      userId,
      type: "debit",
      amount,
      balanceAfter: updatedWallet.balance,
      reference: withdrawal._id,
      description: `Withdrawal request ${withdrawal._id}`,
    });

    return res.status(201).json(
      new ApiResponse(201, { withdrawal }, "Withdrawal request created")
    );
  } catch (err) {
    next(err);
  }
};

const myWithdrawals = async (req, res, next) => {
  try {
    const { error, value } = listSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit } = value;
    const userId = req.user._id;

    const { withdrawals, total } = await walletService.findWithdrawalsByUserId(
      userId,
      page,
      limit
    );

    return res.status(200).json(
      new ApiResponse(200, { withdrawals, total, page, limit }, "Withdrawals fetched")
    );
  } catch (err) {
    next(err);
  }
};

const getWithdrawal = async (req, res, next) => {
  try {
    const { error, value } = getWithdrawalSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { withdrawalId } = value;
    const userId = req.user._id;

    const withdrawal = await walletService.findWithdrawalById(withdrawalId);
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");

    if (withdrawal.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(
      new ApiResponse(200, { withdrawal }, "Withdrawal fetched")
    );
  } catch (err) {
    next(err);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const { error, value } = getInvoiceSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const userId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction) throw new ApiError(404, "Transaction not found");

    const isBuyer = transaction.buyerId.toString() === userId.toString();
    const isVendor = transaction.vendorId.toString() === userId.toString();
    if (!isBuyer && !isVendor) throw new ApiError(403, "Access denied");

    let invoice = await invoiceService.findInvoiceByTransactionId(transactionId);
    if (!invoice) {
      invoice = await invoiceService.generateInvoiceForTransaction(transaction);
    }

    return res.status(200).json(
      new ApiResponse(200, { invoice }, "Invoice fetched")
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWallet,
  getLedger,
  createBankDetails,
  getBankDetails,
  createWithdrawal,
  myWithdrawals,
  getWithdrawal,
  getInvoice,
};
