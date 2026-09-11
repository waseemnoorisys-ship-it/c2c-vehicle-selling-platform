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
      const data = await chatApi.myConversations(1, 100);
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
    set((state) => {
      // Check if belongs to active conversation
      if (message.conversationId === state.activeConversationId) {
        // Prevent duplicates
        const exists = state.messages.some((m) => m._id === message._id);
        if (exists) return state;
        return { messages: [...state.messages, message] };
      }
      return state;
    });

    // Update conversation last message & unread
    set((state) => {
      const updatedConvs = state.conversations.map((c) => {
        if (c._id === message.conversationId) {
          return {
            ...c,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
          };
        }
        return c;
      });

      const isCurrentActive = message.conversationId === state.activeConversationId;
      const newUnreads = { ...state.unreadCounts };
      if (!isCurrentActive) {
        newUnreads[message.conversationId] = (newUnreads[message.conversationId] || 0) + 1;
      }

      return { conversations: updatedConvs, unreadCounts: newUnreads };
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
