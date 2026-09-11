const Conversation = require("../../models/conversation/conversation.model");
const Message = require("../../models/message/message.model");
const ChatBlock = require("../../models/chatBlock/chatBlock.model");
const ConversationReport = require("../../models/conversationReport/conversationReport.model");

async function findConversation(buyerId, vendorId, listingId) {
  return Conversation.findOne({
    buyerId,
    vendorId,
    listingId,
    deletedAt: null,
  });
}

async function createConversation(data) {
  return Conversation.create(data);
}

async function findConversationById(id) {
  return Conversation.findOne({ _id: id, deletedAt: null })
    .populate("buyerId", "firstName lastName profilePhoto fcmToken language")
    .populate("vendorId", "firstName lastName profilePhoto fcmToken language")
    .populate({
      path: "listingId",
      select: "title registrationNumber year photos images status askingPrice price makeId modelId",
      populate: [
        { path: "makeId", select: "name" },
        { path: "modelId", select: "name" },
      ],
    });
}

async function findConversationsByUserId(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    Conversation.find({
      $or: [{ buyerId: userId }, { vendorId: userId }],
      deletedAt: null,
    })
      .populate("buyerId", "firstName lastName profilePhoto")
      .populate("vendorId", "firstName lastName profilePhoto")
      .populate({
        path: "listingId",
        select: "title registrationNumber year photos images status askingPrice price makeId modelId",
        populate: [
          { path: "makeId", select: "name" },
          { path: "modelId", select: "name" },
        ],
      })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments({
      $or: [{ buyerId: userId }, { vendorId: userId }],
      deletedAt: null,
    }),
  ]);
  return { conversations, total };
}

async function updateConversationById(id, update) {
  return Conversation.findByIdAndUpdate(id, update, { new: true });
}

async function closeConversationsByListingId(listingId) {
  return Conversation.updateMany(
    { listingId, isActive: true, deletedAt: null },
    { isActive: false },
  );
}

async function findAllConversations(filter, skip, limit) {
  return Conversation.find(filter)
    .populate("buyerId", "firstName lastName email")
    .populate("vendorId", "firstName lastName email")
    .populate("listingId", "registrationNumber year status ")
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countAllConversations(filter) {
  return Conversation.countDocuments(filter);
}

//verify is any replay message exist or not ?
async function findReplyMessage(messageId) {
  return Message.findOne({
    _id: messageId,
    isDeleted: false,
  }).select("_id content senderId senderRole createdAt");
}
async function createMessage(data) {
  return Message.create(data);
}

async function findMessagesByConversationId(conversationId, page, limit) {
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate("senderId", "firstName lastName profilePhoto")
      .populate({
        path: "replyTo",
        select: "content senderId senderRole createdAt",
        populate: {
          path: "senderId",
          select: "firstName lastName profilePhoto",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId }),
  ]);
  return { messages: messages.reverse(), total };
}

async function findMessageById(id) {
  //adding a replay message functionality
  return Message.findOne({ _id: id, isDeleted: false })
    .populate("senderId", "firstName lastName profilePhoto")
    .populate({
      path: "replyTo",
      select: "content senderId senderRole createdAt",
      populate: {
        path: "senderId",
        select: "firstName lastName profilePhoto",
      },
    });
 
}

async function updateMessageById(id, update) {
  return Message.findByIdAndUpdate(id, update, { new: true });
}
//reply message functionality
async function reactToMessage(messageId, userId, emoji) {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    return null;
  }

  const existingReactionIndex = message.reactions.findIndex(
    (reaction) => reaction.userId.toString() === userId.toString(),
  );

  if (existingReactionIndex === -1) {
    // First reaction
    message.reactions.push({
      userId,
      emoji,
    });
  } else {
    const existingReaction = message.reactions[existingReactionIndex];

    if (existingReaction.emoji === emoji) {
      // Same emoji clicked again -> remove reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Change reaction
      existingReaction.emoji = emoji;
      existingReaction.reactedAt = new Date();
    }
  }

  await message.save();

  return message;
}

async function markMessagesAsRead(conversationId, recipientId) {
  return Message.updateMany(
    {
      conversationId,
      senderId: { $ne: recipientId },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
      isDelivered: true,
    },
  );
}

async function findBlock(blockerId, blockedId) {
  return ChatBlock.findOne({ blockerId, blockedId, deletedAt: null });
}

async function findBlockEither(userAId, userBId) {
  return ChatBlock.findOne({
    $or: [
      { blockerId: userAId, blockedId: userBId },
      { blockerId: userBId, blockedId: userAId },
    ],
    deletedAt: null,
  });
}

async function createBlock(blockerId, blockedId) {
  return ChatBlock.findOneAndUpdate(
    { blockerId, blockedId },
    { blockerId, blockedId, deletedAt: null },
    { new: true, upsert: true },
  );
}

async function removeBlock(blockerId, blockedId) {
  return ChatBlock.findOneAndUpdate(
    { blockerId, blockedId },
    { deletedAt: new Date() },
    { new: true },
  );
}

async function createReport(data) {
  return ConversationReport.create(data);
}

async function findExistingReport(conversationId, reporterId) {
  return ConversationReport.findOne({
    conversationId,
    reporterId,
    deletedAt: null,
  });
}

async function findAllReports(filter, skip, limit) {
  return ConversationReport.find(filter)
    .populate("conversationId")
    .populate("reporterId", "firstName lastName email")
    .populate("reviewedBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countReports(filter) {
  return ConversationReport.countDocuments(filter);
}

async function findReportById(id) {
  return ConversationReport.findOne({ _id: id, deletedAt: null });
}

async function updateReportById(id, update) {
  return ConversationReport.findByIdAndUpdate(id, update, { new: true });
}

async function findAllConversationsForAdmin(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    Conversation.find({ deletedAt: null })
      .populate("buyerId", "firstName lastName profilePhoto role email")
      .populate("vendorId", "firstName lastName profilePhoto role email")
      .populate({
        path: "listingId",
        select: "title registrationNumber year photos images status askingPrice price makeId modelId",
        populate: [
          { path: "makeId", select: "name" },
          { path: "modelId", select: "name" },
        ],
      })
      .sort({ updatedAt: -1, lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments({ deletedAt: null }),
  ]);
  return { conversations, total };
}

module.exports = {
  findConversation,
  createConversation,
  findConversationById,
  findConversationsByUserId,
  findAllConversationsForAdmin,
  updateConversationById,
  closeConversationsByListingId,
  findAllConversations,
  countAllConversations,
  createMessage,
  findMessagesByConversationId,
  findMessageById,
  updateMessageById,
  markMessagesAsRead,
  findBlock,
  findBlockEither,
  createBlock,
  removeBlock,
  createReport,
  findExistingReport,
  findAllReports,
  countReports,
  findReportById,
  updateReportById,
  //replay message
  findReplyMessage,
  reactToMessage,
};

