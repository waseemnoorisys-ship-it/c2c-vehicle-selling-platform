const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const adminWithdrawalService = require("../../../services/admin/adminWithdrawal/adminWithdrawal.service");
const walletService = require("../../../services/wallet/wallet.service");
const { createAuditLog } = require("../../../utils/auditLogger");
const { decrypt } = require("../../../utils/encryption");
const {
  listWithdrawalsSchema,
  withdrawalIdSchema,
  rejectWithdrawalSchema,
} = require("../../../validators/admin/adminWithdrawal/adminwithdrawal.validators");
const { sendPushNotification } = require("../../../services/push/push.service");
const { sendEmail } = require("../../../services/email/email.service");
const { t } = require("../../../utils/i18n");
const logger = require("../../../config/logger");

const listWithdrawals = async (req, res, next) => {
  try {
    const { error, value } = listWithdrawalsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, status } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;

    const [withdrawals, total] = await Promise.all([
      adminWithdrawalService.findAllWithdrawals(filter, skip, limit),
      adminWithdrawalService.countWithdrawals(filter),
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { withdrawals, total, page, limit },
          "Withdrawals fetched",
        ),
      );
  } catch (err) {
    next(err);
  }
};

const getWithdrawal = async (req, res, next) => {
  try {
    const { error, value } = withdrawalIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const withdrawal = await adminWithdrawalService.findWithdrawalById(
      value.withdrawalId,
    );
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");

    let bankDetails = null;
    if (withdrawal.bankDetailsId) {
      const bd = withdrawal.bankDetailsId;
      bankDetails = {
        accountHolderName: bd.accountHolderName,
        bankName: bd.bankName,
        accountNumber: decrypt(bd.accountNumberEncrypted),
        ifscOrRouting: decrypt(bd.ifscOrRoutingEncrypted),
      };
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { withdrawal, bankDetails }, "Withdrawal fetched"),
      );
  } catch (err) {
    next(err);
  }
};

const approveWithdrawal = async (req, res, next) => {
  try {
    const { error, value } = withdrawalIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const withdrawal = await adminWithdrawalService.findWithdrawalById(
      value.withdrawalId,
    );
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");

    if (withdrawal.status !== "pending") {
      throw new ApiError(400, "Only pending withdrawals can be approved");
    }

    await adminWithdrawalService.updateWithdrawalById(value.withdrawalId, {
      status: "approved",
      processedAt: new Date(),
    });

    await createAuditLog({
      adminId: req.admin._id,
      action: "APPROVE_WITHDRAWAL",
      resource: "Withdrawal",
      resourceId: withdrawal._id,
      meta: { amount: withdrawal.amount, userId: withdrawal.userId },
    });
    try {
      const vendor =
        await require("../../../services/admin/adminUser/adminUser.service").findUserById(
          withdrawal.userId._id,
        );
      const lang = vendor?.language || "en";
      const formattedAmount = `$${(withdrawal.amount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: vendor?.fcmToken,
        title: t("withdrawal.approved.title", lang),
        body: t("withdrawal.approved.body", lang, { amount: formattedAmount }),
        data: { withdrawalId: withdrawal._id.toString() },
      });

      await sendEmail({
        to: vendor.email,
        templateName: "withdrawalUpdate",
        data: {
          firstName: vendor.firstName,
          status: "approved",
          amount: formattedAmount,
          lang,
        },
      });
    } catch (err) {
      logger.error("Withdrawal approved notification failed", err);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Withdrawal approved successfully"));
  } catch (err) {
    next(err);
  }
};

const markWithdrawalPaid = async (req, res, next) => {
  try {
    const { error, value } = withdrawalIdSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const withdrawal = await adminWithdrawalService.findWithdrawalById(
      value.withdrawalId,
    );
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");

    if (withdrawal.status !== "approved") {
      throw new ApiError(
        400,
        "Only approved withdrawals can be marked as paid",
      );
    }

    await adminWithdrawalService.updateWithdrawalById(value.withdrawalId, {
      status: "paid",
      processedAt: new Date(),
    });

    await createAuditLog({
      adminId: req.admin._id,
      action: "MARK_WITHDRAWAL_PAID",
      resource: "Withdrawal",
      resourceId: withdrawal._id,
      meta: { amount: withdrawal.amount, userId: withdrawal.userId },
    });
    try {
      const vendor =
        await require("../../../services/admin/adminUser/adminUser.service").findUserById(
          withdrawal.userId._id,
        );
      const lang = vendor?.language || "en";
      const formattedAmount = `$${(withdrawal.amount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: vendor?.fcmToken,
        title: t("withdrawal.approved.title", lang),
        body: t("withdrawal.approved.body", lang, { amount: formattedAmount }),
        data: { withdrawalId: withdrawal._id.toString() },
      });

      await sendEmail({
        to: vendor.email,
        templateName: "withdrawalUpdate",
        data: {
          firstName: vendor.firstName,
          status: "paid",
          amount: formattedAmount,
          lang,
        },
      });
    } catch (err) {
      logger.error("Withdrawal approved notification failed", err);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Withdrawal marked as paid"));
  } catch (err) {
    next(err);
  }
};

const rejectWithdrawal = async (req, res, next) => {
  try {
    const { error, value } = rejectWithdrawalSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { withdrawalId, rejectionReason } = value;

    const withdrawal =
      await adminWithdrawalService.findWithdrawalById(withdrawalId);
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");

    if (withdrawal.status !== "pending") {
      throw new ApiError(400, "Only pending withdrawals can be rejected");
    }

    await adminWithdrawalService.updateWithdrawalById(withdrawalId, {
      status: "rejected",
      rejectionReason,
      processedAt: new Date(),
    });

    const wallet = await walletService.findOrCreateWallet(
      withdrawal.userId._id,
      withdrawal.currency,
    );

    const updatedWallet = await walletService.creditWallet(
      wallet._id,
      withdrawal.amount,
    );

    await walletService.createLedgerEntry({
      walletId: wallet._id,
      userId: withdrawal.userId._id,
      type: "credit",
      amount: withdrawal.amount,
      balanceAfter: updatedWallet.balance,
      reference: withdrawal._id,
      description: `Withdrawal rejection reversal for withdrawal ${withdrawalId}`,
    });

    await createAuditLog({
      adminId: req.admin._id,
      action: "REJECT_WITHDRAWAL",
      resource: "Withdrawal",
      resourceId: withdrawal._id,
      meta: {
        amount: withdrawal.amount,
        userId: withdrawal.userId,
        rejectionReason,
      },
    });
    try {
      const vendor =
        await require("../../../services/admin/adminUser/adminUser.service").findUserById(
          withdrawal.userId._id,
        );
      const lang = vendor?.language || "en";
      const formattedAmount = `$${(withdrawal.amount / 100).toFixed(2)}`;

      await sendPushNotification({
        fcmToken: vendor?.fcmToken,
        title: t("withdrawal.approved.title", lang),
        body: t("withdrawal.approved.body", lang, { amount: formattedAmount }),
        data: { withdrawalId: withdrawal._id.toString() },
      });

      await sendEmail({
        to: vendor.email,
        templateName: "withdrawalUpdate",
        data: {
          firstName: vendor.firstName,
          status: "rejected",
          rejectionReason,
          amount: formattedAmount,
          lang,
        },
      });
    } catch (err) {
      logger.error("Withdrawal approved notification failed", err);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Withdrawal rejected and funds returned to wallet",
        ),
      );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listWithdrawals,
  getWithdrawal,
  approveWithdrawal,
  markWithdrawalPaid,
  rejectWithdrawal,
};
