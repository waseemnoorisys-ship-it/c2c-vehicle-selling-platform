const chatService = require("../../services/chat/chat.service");
const { sendPushNotification } = require("../../services/push/push.service");
const logger = require("../../config/logger");

function registerMessageHandlers(io, socket, onlineUsers) {
  socket.on("send_message", async (data) => {
    try {
      const conversationId = String(data?.conversationId || "").trim();
      const content = typeof data?.content === "string" ? data.content.trim() : "";
      const type = data?.type || "text";
      const sender = socket.data.user;

      if (!conversationId || !content) {
        socket.emit("error", { message: "conversationId and content required" });
        return;
      }

      if (content.length > 2000) {
        socket.emit("error", { message: "Message too long" });
        return;
      }

      const conversation = await chatService.findConversationById(conversationId);
      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" });
        return;
      }

      if (!conversation.isActive) {
        socket.emit("error", {
          message: "This conversation is closed. The listing is no longer active.",
        });
        return;
      }

      const isBuyer =
        conversation.buyerId._id.toString() === sender._id.toString();
      const isVendor =
        conversation.vendorId._id.toString() === sender._id.toString();

      if (!isBuyer && !isVendor) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      const block = await chatService.findBlock(
        conversation.vendorId._id,
        conversation.buyerId._id
      );
      if (block) {
        socket.emit("error", { message: "Messaging is not available" });
        return;
      }

      const senderRole = isBuyer ? "buyer" : "vendor";

      const message = await chatService.createMessage({
        conversationId,
        senderId: sender._id,
        senderRole,
        type,
        content,
      });

      await chatService.updateConversationById(conversationId, {
        $set: {
          lastMessage: type === "image" ? "📷 Image" : content,
          lastMessageAt: new Date(),
        },
        $inc: isBuyer ? { vendorUnread: 1 } : { buyerUnread: 1 },
      });

      const populatedMessage = {
        _id: message._id,
        conversationId,
        senderId: {
          _id: sender._id,
          firstName: sender.firstName,
          lastName: sender.lastName,
        },
        senderRole,
        type,
        content,
        isRead: false,
        isEdited: false,
        isDeleted: false,
        createdAt: message.createdAt,
      };

      // Ensure sender is in the room, then broadcast to everyone in conversation
      socket.join(conversationId);
      io.to(conversationId).emit("new_message", populatedMessage);

      const recipientId = isBuyer
        ? conversation.vendorId._id.toString()
        : conversation.buyerId._id.toString();

      const recipientPresence = onlineUsers.get(recipientId);
      const isRecipientOffline =
        !recipientPresence || !recipientPresence.isOnline;

      if (isRecipientOffline) {
        try {
          const recipient = isBuyer
            ? conversation.vendorId
            : conversation.buyerId;

          const senderName = sender.firstName;
          const preview =
            type === "image"
              ? "📷 Image"
              : content.length > 50
              ? `${content.substring(0, 50)}...`
              : content;

          await sendPushNotification({
            fcmToken: recipient.fcmToken,
            title: `New message from ${senderName}`,
            body: preview,
            data: {
              conversationId,
              type: "new_message",
            },
          });
        } catch (pushErr) {
          logger.error("Chat push notification failed", pushErr);
        }
      }
    } catch (err) {
      logger.error("send_message handler error", err);
      socket.emit("error", { message: err.message || "Failed to send message" });
    }
  });

  socket.on("mark_read", async ({ conversationId }) => {
    try {
      const roomId = String(conversationId || "").trim();
      if (!roomId) return;

      const userId = socket.data.user._id;

      const conversation = await chatService.findConversationById(roomId);
      if (!conversation) return;

      const isBuyer =
        conversation.buyerId._id.toString() === userId.toString();
      const isVendor =
        conversation.vendorId._id.toString() === userId.toString();

      if (!isBuyer && !isVendor) return;

      await chatService.markMessagesAsRead(roomId, userId);

      const unreadField = isBuyer ? "buyerUnread" : "vendorUnread";
      await chatService.updateConversationById(roomId, {
        $set: { [unreadField]: 0 },
      });

      socket.to(roomId).emit("messages_read", {
        conversationId: roomId,
        readBy: userId,
        readAt: new Date(),
      });
    } catch (err) {
      logger.error("mark_read handler error", err);
    }
  });
}

module.exports = {
  registerMessageHandlers,
};
