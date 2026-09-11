import api from "./axios";

export const chatApi = {
  createOrGetConversation: async (listingId) => {
    const response = await api.post("/chat/conversations/create", { listingId });
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await api.post("/chat/conversations/get", { conversationId });
    return response.data;
  },

  myConversations: async (page = 1, limit = 50) => {
    const response = await api.post("/chat/conversations/mine", { page, limit });
    return response.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.post("/chat/messages/list", { conversationId, page, limit });
    return response.data;
  },

  uploadChatMedia: async (formData) => {
    const response = await api.post("/chat/messages/upload-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  editMessage: async (messageId, newContent) => {
    const response = await api.post("/chat/messages/edit", { messageId, newContent });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.post("/chat/messages/delete", { messageId });
    return response.data;
  },

  blockUser: async (blockedUserId) => {
    const response = await api.post("/chat/block/create", { blockedUserId });
    return response.data;
  },

  unblockUser: async (blockedUserId) => {
    const response = await api.post("/chat/block/remove", { blockedUserId });
    return response.data;
  },

  reportConversation: async (conversationId, reason) => {
    const response = await api.post("/chat/report", { conversationId, reason });
    return response.data;
  },
};

export default chatApi;
