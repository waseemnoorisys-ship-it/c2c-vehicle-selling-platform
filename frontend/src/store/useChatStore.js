import { create } from "zustand";
import chatApi from "../api/chat.api";
import socketService from "../services/socket.service";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [], // Array of messages for the active conversation
  messagesPage: 1,
  hasMoreMessages: true,
  isLoadingConversations: false,
  isLoadingMessages: false,
  typingUsers: {}, // conversationId -> Array of userIds typing
  onlineUsers: {}, // userId -> { isOnline, lastSeen }
  unreadCounts: {}, // conversationId -> count

  setConversations: (conversations) => set({ conversations }),
  
  upsertConversation: (conversation) => {
    if (!conversation || !conversation._id) return;
    set((state) => {
      const exists = state.conversations.some((c) => c._id === conversation._id);
      const updatedConvs = exists
        ? state.conversations.map((c) => (c._id === conversation._id ? conversation : c))
        : [conversation, ...state.conversations];
      return { conversations: updatedConvs };
    });
  },

  setActiveConversationId: (id) => {
    const currentId = get().activeConversationId;
    if (currentId && currentId !== id) {
      socketService.leaveConversation(currentId);
    }
    set({ activeConversationId: id, messages: [], messagesPage: 1, hasMoreMessages: true });
    if (id) {
      socketService.joinConversation(id);
      get().fetchMessages(id, 1);
      socketService.markRead(id);
      get().clearUnread(id);
    }
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const data = await chatApi.myConversations(1, 50);
      const convs = data?.data?.conversations || [];
      const unreads = {};
      convs.forEach((c) => {
        unreads[c._id] = c.unreadCount || 0;
      });
      set({ conversations: convs, unreadCounts: unreads, isLoadingConversations: false });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const data = await chatApi.getMessages(conversationId, page, 50);
      const fetchedMessages = data?.data?.messages || [];
      
      set((state) => ({
        messages: page === 1 ? fetchedMessages : [...fetchedMessages, ...state.messages],
        messagesPage: page,
        hasMoreMessages: fetchedMessages.length >= 50,
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    if (!message) return;
    const msgConvId = (message.conversationId?._id || message.conversationId)?.toString();

    set((state) => {
      const activeId = state.activeConversationId?.toString();
      let updatedMessages = state.messages;

      if (msgConvId && activeId && msgConvId === activeId) {
        const exists = state.messages.some(
          (m) => m._id?.toString() === message._id?.toString()
        );
        if (!exists) {
          updatedMessages = [...state.messages, message];
        }
      }

      const updatedConvs = state.conversations.map((c) => {
        if (c._id?.toString() === msgConvId) {
          return {
            ...c,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
          };
        }
        return c;
      });

      const isCurrentActive = msgConvId === activeId;
      const newUnreads = { ...state.unreadCounts };
      if (!isCurrentActive && msgConvId) {
        newUnreads[msgConvId] = (newUnreads[msgConvId] || 0) + 1;
      }

      return {
        messages: updatedMessages,
        conversations: updatedConvs,
        unreadCounts: newUnreads,
      };
    });
  },

  updateMessage: (updatedMsg) => {
    set((state) => ({
      messages: state.messages.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)),
    }));
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
      ),
    }));
  },

  clearUnread: (conversationId) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    }));
  },

  markAllMessagesRead: (conversationId) => {
    set((state) => {
      const activeId = state.activeConversationId?.toString();
      const targetId = conversationId?.toString();
      if (activeId && targetId && activeId === targetId) {
        return {
          messages: state.messages.map((m) => ({
            ...m,
            isRead: true,
            readAt: m.readAt || new Date().toISOString(),
          })),
        };
      }
      return {};
    });
  },

  setUserTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const currentList = state.typingUsers[conversationId] || [];
      let updatedList = [];
      if (isTyping) {
        if (!currentList.includes(userId)) updatedList = [...currentList, userId];
        else updatedList = currentList;
      } else {
        updatedList = currentList.filter((id) => id !== userId);
      }
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updatedList },
      };
    });
  },

  setUserOnline: (userId, isOnline, lastSeen = null) => {
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: { isOnline, lastSeen: lastSeen || new Date() },
      },
    }));
  },
}));

export default useChatStore;
