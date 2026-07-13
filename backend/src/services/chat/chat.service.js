const Conversation = require("../../models/conversation/conversation.model");
const Message = require("../../models/message/message.model");
const ChatBlock = require("../../models/chatBlock/chatBlock.model");

async function findConversation(buyerId, vendorId, listingId) {
  return Conversation.findOne({ buyerId, vendorId, listingId, deletedAt: null });
}

async function createConversation(data) {
  return Conversation.create(data);
}

async function findConversationById(id) {
  return Conversation.findOne({ _id: id, deletedAt: null })
    .populate("buyerId", "firstName lastName profilePhoto fcmToken language")
    .populate("vendorId", "firstName lastName profilePhoto fcmToken language")
    .populate("listingId", "registrationNumber year photos status");
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
      .populate("listingId", "registrationNumber year photos status")
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

async function createMessage(data) {
  return Message.create(data);
}

async function findMessagesByConversationId(conversationId, page, limit) {
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ conversationId, isDeleted: false })
      .populate("senderId", "firstName lastName profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId, isDeleted: false }),
  ]);
  return { messages: messages.reverse(), total };
}

async function findMessageById(id) {
  return Message.findOne({ _id: id, isDeleted: false });
}

async function updateMessageById(id, update) {
  return Message.findByIdAndUpdate(id, update, { new: true });
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
    }
  );
}

async function findBlock(blockerId, blockedId) {
  return ChatBlock.findOne({ blockerId, blockedId, deletedAt: null });
}

async function createBlock(blockerId, blockedId) {
  return ChatBlock.findOneAndUpdate(
    { blockerId, blockedId },
    { blockerId, blockedId, deletedAt: null },
    { new: true, upsert: true }
  );
}

async function removeBlock(blockerId, blockedId) {
  return ChatBlock.findOneAndUpdate(
    { blockerId, blockedId },
    { deletedAt: new Date() }
  );
}

module.exports = {
  findConversation,
  createConversation,
  findConversationById,
  findConversationsByUserId,
  updateConversationById,
  createMessage,
  findMessagesByConversationId,
  findMessageById,
  updateMessageById,
  markMessagesAsRead,
  findBlock,
  createBlock,
  removeBlock,
};