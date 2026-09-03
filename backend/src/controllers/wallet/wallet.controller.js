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
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

const getWallet = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const userId = req.user._id;
    const wallet = await walletService.findOrCreateWallet(userId, "EUR");
    return res.status(200).json(new ApiResponse(200, { wallet }, t("success.wallet.fetched", lang)));
  } catch (err) {
    next(err);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = listSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit } = value;
    const userId = req.user._id;

    const { entries, total } = await walletService.findLedgerByUserId(userId, page, limit);

    return res.status(200).json(
      new ApiResponse(200, { entries, total, page, limit }, t("success.wallet.ledgerFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

const createBankDetails = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
        t("success.wallet.bankSaved", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const getBankDetails = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const userId = req.user._id;

    const bankDetails = await walletService.findBankDetailsByUserId(userId);
    if (!bankDetails) throw new ApiError(404, t("errors.wallet.noBankDetails", lang));

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
        t("success.wallet.bankFetched", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const createWithdrawal = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = createWithdrawalSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { amount } = value;
    const userId = req.user._id;

    const bankDetails = await walletService.findBankDetailsByUserId(userId);
    if (!bankDetails) {
      throw new ApiError(400, t("errors.wallet.addBankFirst", lang));
    }

    const wallet = await walletService.findOrCreateWallet(userId, "EUR");

    if (amount > wallet.balance) {
      throw new ApiError(400, t("errors.wallet.exceedsBalance", lang));
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
      new ApiResponse(201, { withdrawal }, t("success.wallet.withdrawalCreated", lang))
    );
  } catch (err) {
    next(err);
  }
};

const myWithdrawals = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
      new ApiResponse(200, { withdrawals, total, page, limit }, t("success.wallet.withdrawalsFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

const getWithdrawal = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = getWithdrawalSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { withdrawalId } = value;
    const userId = req.user._id;

    const withdrawal = await walletService.findWithdrawalById(withdrawalId);
    if (!withdrawal) throw new ApiError(404, t("errors.wallet.withdrawalNotFound", lang));

    if (withdrawal.userId.toString() !== userId.toString()) {
      throw new ApiError(403, t("errors.commonExtra.accessDenied", lang));
    }

    return res.status(200).json(
      new ApiResponse(200, { withdrawal }, t("success.wallet.withdrawalFetched", lang))
    );
  } catch (err) {
    next(err);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { error, value } = getInvoiceSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { transactionId } = value;
    const userId = req.user._id;

    const transaction = await paymentService.findTransactionById(transactionId);
    if (!transaction) throw new ApiError(404, t("errors.walletExtra.transactionNotFound", lang));

    const isBuyer = transaction.buyerId.toString() === userId.toString();
    const isVendor = transaction.vendorId.toString() === userId.toString();
    if (!isBuyer && !isVendor) throw new ApiError(403, t("errors.commonExtra.accessDenied", lang));

    let invoice = await invoiceService.findInvoiceByTransactionId(transactionId);
    if (!invoice) {
      invoice = await invoiceService.generateInvoiceForTransaction(transaction);
    }

    return res.status(200).json(
      new ApiResponse(200, { invoice }, t("success.wallet.invoiceFetched", lang))
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
