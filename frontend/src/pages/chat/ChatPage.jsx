import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import socketService from "../../services/socket.service";
import chatApi from "../../api/chat.api";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatPage() {
  const { accessToken, user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const listingIdParam = searchParams.get("listingId");

  const {
    fetchConversations,
    setActiveConversationId,
    addMessage,
    updateMessage,
    removeMessage,
    setUserTyping,
    setUserOnline,
  } = useChatStore();

  useEffect(() => {
    if (!accessToken) return;

    // Connect socket
    const socket = socketService.connect(accessToken);

    // Initial fetch of user conversations
    fetchConversations();

    // Handle listingId URL parameter (e.g. /chat?listingId=xyz)
    if (listingIdParam) {
      chatApi
        .createOrGetConversation(listingIdParam)
        .then((res) => {
          if (res.success && res.data?.conversation?._id) {
            setActiveConversationId(res.data.conversation._id);
            fetchConversations(); // refresh list
          }
        })
        .catch((err) => {
          console.error("Failed to initiate conversation from URL param:", err);
        });
    }

    // Socket Event Listeners
    const handleReceiveMessage = (message) => {
      addMessage(message);
    };

    const handleTypingStart = ({ conversationId, userId }) => {
      setUserTyping(conversationId, userId, true);
    };

    const handleTypingStop = ({ conversationId, userId }) => {
      setUserTyping(conversationId, userId, false);
    };

    const handleUserOnline = ({ userId }) => {
      setUserOnline(userId, true);
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
      setUserOnline(userId, false, lastSeen);
    };

    socket.on("new_message", handleReceiveMessage);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleTypingStart);
    socket.on("typing_start", handleTypingStart);
    socket.on("user_stop_typing", handleTypingStop);
    socket.on("typing_stop", handleTypingStop);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("new_message", handleReceiveMessage);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleTypingStart);
      socket.off("typing_start", handleTypingStart);
      socket.off("user_stop_typing", handleTypingStop);
      socket.off("typing_stop", handleTypingStop);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [accessToken, listingIdParam]);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-[#111b21] overflow-hidden">
      <ConversationList />
      <ChatWindow />
    </div>
  );
}
