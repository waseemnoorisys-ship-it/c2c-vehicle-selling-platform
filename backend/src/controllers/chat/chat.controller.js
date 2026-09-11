const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const chatService = require("../../services/chat/chat.service");
const listingService = require("../../services/listing/listing.service");
const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");
const {
  createConversationSchema,
  getConversationSchema,
  listConversationsSchema,
  listMessagesSchema,
  editMessageSchema,
  deleteMessageSchema,
  blockUserSchema,
  reportConversationSchema,
} = require("../../validators/chat/chat.validators");

const createOrGetConversation = async (req, res, next) => {
  try {
    const { error, value } = createConversationSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { listingId } = value;
    const buyerId = req.user._id;

    if (req.user.role !== "buyer") {
      throw new ApiError(403, "Only buyers can initiate conversations");
    }

    const listing = await listingService.findListingById(listingId);
    if (!listing || listing.deletedAt) {
      throw new ApiError(404, "Listing not found");
    }

    if (listing.status !== "approved") {
      throw new ApiError(400, "Cannot message about an unapproved listing");
    }

    if (listing.vendorId.toString() === buyerId.toString()) {
      throw new ApiError(400, "You cannot message yourself");
    }

    const vendorId = listing.vendorId;

    const block = await chatService.findBlockEither(buyerId, vendorId);
    if (block) {
      throw new ApiError(403, "Messaging is not available");
    }

    let conversation = await chatService.findConversation(
      buyerId,
      vendorId,
      listingId,
    );

    if (!conversation) {
      conversation = await chatService.createConversation({
        buyerId,
        vendorId,
        listingId,
      });
    }

    const populated = await chatService.findConversationById(conversation._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { conversation: populated }, "Conversation ready"),
      );
  } catch (err) {
    next(err);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { error, value } = getConversationSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

    // Handle synthetic admin conversation creation for direct user messaging
    if (value.conversationId.startsWith("admin_synthetic_")) {
      const targetUserId = value.conversationId.replace("admin_synthetic_", "");
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new ApiError(404, "User not found");

      const sampleListing =
        (await Listing.findOne({ deletedAt: null, status: "approved" })) ||
        (await Listing.findOne({ deletedAt: null }));

      if (!sampleListing) {
        throw new ApiError(400, "Cannot start chat: No listings found in system");
      }

      const isVendor = targetUser.role === "vendor";
      const buyerId = isVendor ? userId : targetUser._id;
      const vendorId = isVendor ? targetUser._id : userId;

      let conversation = await chatService.findConversation(
        buyerId,
        vendorId,
        sampleListing._id,
      );

      if (!conversation) {
        conversation = await chatService.createConversation({
          buyerId,
          vendorId,
          listingId: sampleListing._id,
        });
      }

      const populated = await chatService.findConversationById(conversation._id);
      return res
        .status(200)
        .json(new ApiResponse(200, { conversation: populated }, "Conversation ready"));
    }

    const conversation = await chatService.findConversationById(
      value.conversationId,
    );

    if (!conversation) throw new ApiError(404, "Conversation not found");
    // Defensive checks
    if (!conversation.buyerId) {
      throw new ApiError(404, "Buyer not found");
    }

    if (!conversation.vendorId) {
      throw new ApiError(404, "Vendor not found");
    }

    if (!conversation.listingId) {
      throw new ApiError(404, "Listing not found");
    }

    const isBuyer = conversation.buyerId._id.toString() === userId.toString();
    const isVendor = conversation.vendorId._id.toString() === userId.toString();

    if (!isBuyer && !isVendor && !isAdmin) {
      throw new ApiError(403, "Access denied");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { conversation }, "Conversation fetched"));
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const myConversations = async (req, res, next) => {
  try {
    const { error, value } = listConversationsSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { page, limit } = value;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

    let conversations, total;

    if (isAdmin) {
      const adminRes = await chatService.findAllConversationsForAdmin(page, limit);
      conversations = adminRes.conversations || [];
      total = adminRes.total || 0;

      // Collect existing user IDs in system conversations
      const existingUserIds = new Set();
      conversations.forEach((c) => {
        if (c.buyerId?._id) existingUserIds.add(c.buyerId._id.toString());
        if (c.vendorId?._id) existingUserIds.add(c.vendorId._id.toString());
      });

      // Fetch all buyers & vendors so admin can see and chat with ANY buyer or vendor
      const remainingUsers = await User.find({
        _id: { $nin: Array.from(existingUserIds) },
        role: { $in: ["buyer", "vendor"] },
        deletedAt: null,
      }).select("firstName lastName profilePhoto role email createdAt");

      if (remainingUsers.length > 0) {
        const sampleListing =
          (await Listing.findOne({ deletedAt: null, status: "approved" })) ||
          (await Listing.findOne({ deletedAt: null }));

        const syntheticConvs = remainingUsers.map((u) => {
          const isVendor = u.role === "vendor";
          return {
            _id: `admin_synthetic_${u._id}`,
            isSynthetic: true,
            buyerId: isVendor ? req.user : u,
            vendorId: isVendor ? u : req.user,
            listingId: sampleListing || null,
            lastMessage: null,
            lastMessageAt: u.createdAt,
            updatedAt: u.createdAt,
            buyerUnread: 0,
            vendorUnread: 0,
          };
        });

        conversations = [...conversations, ...syntheticConvs];
        total += syntheticConvs.length;
      }
    } else {
      const userRes = await chatService.findConversationsByUserId(userId, page, limit);
      conversations = userRes.conversations || [];
      total = userRes.total || 0;
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { conversations, total, page, limit },
          "Conversations fetched",
        ),
      );
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { error, value } = listMessagesSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { conversationId, page, limit } = value;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

    if (conversationId.startsWith("admin_synthetic_")) {
      return res.status(200).json(
        new ApiResponse(
          200,
          { messages: [], total: 0, page, limit },
          "Messages fetched",
        ),
      );
    }

    const conversation = await chatService.findConversationById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");
    if (!conversation.buyerId) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }
    if (!conversation.vendorId) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const isBuyer = conversation.buyerId._id.toString() === userId.toString();
    const isVendor = conversation.vendorId._id.toString() === userId.toString();

    if (!isBuyer && !isVendor && !isAdmin) {
      throw new ApiError(403, "Access denied ");
    }

    const { messages, total } = await chatService.findMessagesByConversationId(
      conversationId,
      page,
      limit,
    );

    await chatService.markMessagesAsRead(conversationId, userId);

    const unreadField = isBuyer ? "buyerUnread" : "vendorUnread";
    await chatService.updateConversationById(conversationId, {
      [unreadField]: 0,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { messages, total, page, limit },
          "Messages fetched",
        ),
      );
  } catch (err) {
    throw new ApiError(404, "conversation not found");
  }
};

const uploadChatMedia = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No image uploaded");

    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const conversationId = req.body.conversationId;

    if (!conversationId) {
      throw new ApiError(400, "conversationId is required");
    }

    const conversation = await chatService.findConversationById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");

    if (!conversation.isActive) {
      throw new ApiError(400, "This conversation is closed");
    }

    const isBuyer = conversation.buyerId._id.toString() === userId.toString();
    const isVendor = conversation.vendorId._id.toString() === userId.toString();

    if (!isBuyer && !isVendor && !isAdmin) {
      throw new ApiError(403, "Access denied");
    }

    // const result = await new Promise((resolve, reject) => {
    //   const stream = cloudinary.uploader.upload_stream(
    //     { folder: "chat_images" },
    //     (error, result) => {
    //       if (error) return reject(error);
    //       resolve(result);
    //     },
    //   );
    //   streamifier.createReadStream(req.file.buffer).pipe(stream);
    // });
    //voice message
    const folderMap = {
      image: "chat_images",
      video: "chat_videos",
      raw: "chat_documents",
    };

    const resourceType = req.file.mimetype.startsWith("image/")
      ? "image"
      : req.file.mimetype.startsWith("video/")
        ? "video"
        : req.file.mimetype.startsWith("audio/")
          ? "video" // Cloudinary stores audio as video
          : "raw";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folderMap[resourceType],
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          url: result.secure_url,
          publicId: result.public_id,

          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
        "Media uploaded",
      ),
    );
  } catch (err) {
    next(err);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const { error, value } = editMessageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { messageId, newContent } = value;
    const userId = req.user._id;

    const message = await chatService.findMessageById(messageId);
    if (!message) throw new ApiError(404, "Message not found");

    if (message.senderId.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only edit your own messages");
    }

    if (message.type === "image") {
      throw new ApiError(400, "Image messages cannot be edited");
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      throw new ApiError(400, "Messages can only be edited within 5 minutes");
    }

    const updated = await chatService.updateMessageById(messageId, {
      content: newContent,
      isEdited: true,
      editedAt: new Date(),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { message: updated }, "Message edited"));
  } catch (err) {
    next(err);
  }
};

// const deleteMessage = async (req, res, next) => {
//   try {
//     const { error, value } = deleteMessageSchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { messageId } = value;
//     const userId = req.user._id;

//     const message = await chatService.findMessageById(messageId);
//     if (!message) throw new ApiError(404, "Message not found");

//     if (message.senderId.toString() !== userId.toString()) {
//       throw new ApiError(403, "You can only delete your own messages");
//     }

//     await chatService.updateMessageById(messageId, {
//       isDeleted: true,
//       deletedAt: new Date(),
//       content: "This message was deleted",
//     });

//     return res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
//   } catch (err) {
//     next(err);
//   }
// };

const deleteMessage = async (req, res, next) => {
  try {
    const { error, value } = deleteMessageSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { messageId } = value;
    const userId = req.user._id;

    const message = await chatService.findMessageById(messageId);
    if (!message) throw new ApiError(404, "Message not found");

    // Works whether senderId is populated or not
    const senderId = message.senderId._id || message.senderId;

    if (senderId.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own messages");
    }

    await chatService.updateMessageById(messageId, {
      isDeleted: true,
      deletedAt: new Date(),
      content: "This message was deleted",
    });

    return res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { error, value } = blockUserSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const blockerId = req.user._id;
    const { blockedUserId } = value;

    if (blockerId.toString() === blockedUserId) {
      throw new ApiError(400, "You cannot block yourself");
    }

    const existing = await chatService.findBlock(blockerId, blockedUserId);
    if (existing) throw new ApiError(409, "User is already blocked");

    await chatService.createBlock(blockerId, blockedUserId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User blocked successfully"));
  } catch (err) {
    next(err);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { error, value } = blockUserSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const blockerId = req.user._id;
    const { blockedUserId } = value;

    const existing = await chatService.findBlock(blockerId, blockedUserId);
    if (!existing) throw new ApiError(404, "Block not found");

    await chatService.removeBlock(blockerId, blockedUserId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User unblocked successfully"));
  } catch (err) {
    next(err);
  }
};

const reportConversation = async (req, res, next) => {
  try {
    const { error, value } = reportConversationSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { conversationId, reason } = value;
    const reporterId = req.user._id;

    const conversation = await chatService.findConversationById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");

    const isBuyer =
      conversation.buyerId._id.toString() === reporterId.toString();
    const isVendor =
      conversation.vendorId._id.toString() === reporterId.toString();

    if (!isBuyer && !isVendor) {
      throw new ApiError(403, "You are not part of this conversation");
    }

    const existing = await chatService.findExistingReport(
      conversationId,
      reporterId,
    );
    if (existing) {
      throw new ApiError(409, "You have already reported this conversation");
    }

    const report = await chatService.createReport({
      conversationId,
      reporterId,
      reason,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { report }, "Conversation reported successfully"),
      );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrGetConversation,
  getConversation,
  myConversations,
  getMessages,
  // uploadChatImage,
  uploadChatMedia,
  editMessage,
  deleteMessage,
  blockUser,
  unblockUser,
  reportConversation,
};
