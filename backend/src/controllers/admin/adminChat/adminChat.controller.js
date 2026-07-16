const ApiError = require("../../../utils/ApiError");
const ApiResponse = require("../../../utils/ApiResponse");
const chatService = require("../../../services/chat/chat.service");
const { createAuditLog } = require("../../../utils/auditLogger");
const {
  adminListConversationsSchema,
  listMessagesSchema,
  adminReviewReportSchema,
} = require("../../../validators/chat/chat.validators");
const Joi = require("joi");

const listAllConversations = async (req, res, next) => {
  try {
    const { error, value } = adminListConversationsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, isActive, listingId } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (listingId) filter.listingId = listingId;

    const [conversations, total] = await Promise.all([
      chatService.findAllConversations(filter, skip, limit),
      chatService.countAllConversations(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        { conversations, total, page, limit },
        "Conversations fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { error, value } = listMessagesSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { conversationId, page, limit } = value;

    const conversation = await chatService.findConversationById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");

    const { messages, total } =
      await chatService.findMessagesByConversationId(
        conversationId,
        page,
        limit
      );

    await createAuditLog({
      adminId: req.admin._id,
      action: "READ_CONVERSATION",
      resource: "Conversation",
      resourceId: conversation._id,
      meta: { conversationId },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { messages, total, page, limit },
        "Messages fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

const listReports = async (req, res, next) => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20),
      status: Joi.string()
        .valid("pending", "reviewed", "dismissed")
        .optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit, status } = value;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
      chatService.findAllReports(filter, skip, limit),
      chatService.countReports(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        { reports, total, page, limit },
        "Reports fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

const reviewReport = async (req, res, next) => {
  try {
    const { error, value } = adminReviewReportSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { reportId, status } = value;

    const report = await chatService.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    if (report.status !== "pending") {
      throw new ApiError(400, "Report has already been reviewed");
    }

    const updated = await chatService.updateReportById(reportId, {
      status,
      reviewedBy: req.admin._id,
      reviewedAt: new Date(),
    });

    await createAuditLog({
      adminId: req.admin._id,
      action: "REVIEW_CHAT_REPORT",
      resource: "ConversationReport",
      resourceId: report._id,
      meta: { status, conversationId: report.conversationId },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { report: updated }, "Report reviewed successfully")
      );
  } catch (err) {
    next(err);
  }
};

const closeConversation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      conversationId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const conversation = await chatService.findConversationById(
      value.conversationId
    );
    if (!conversation) throw new ApiError(404, "Conversation not found");

    if (!conversation.isActive) {
      throw new ApiError(400, "Conversation is already closed");
    }

    await chatService.updateConversationById(value.conversationId, {
      isActive: false,
    });

    await createAuditLog({
      adminId: req.admin._id,
      action: "CLOSE_CONVERSATION",
      resource: "Conversation",
      resourceId: conversation._id,
      meta: { conversationId: value.conversationId },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Conversation closed successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAllConversations,
  getConversationMessages,
  listReports,
  reviewReport,
  closeConversation,
};