import React, { useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";

export default function ConversationList() {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    unreadCounts,
    onlineUsers,
    isLoadingConversations,
  } = useChatStore();

  const [search, setSearch] = useState("");

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getOtherParticipant = (conv) => {
    const isBuyer = (conv.buyerId?._id || conv.buyerId) === (user?._id || user?.id);
    return isBuyer ? conv.vendorId : conv.buyerId;
  };

  const filteredConversations = conversations.filter((conv) => {
    const partner = getOtherParticipant(conv);
    const name = `${partner?.firstName || ""} ${partner?.lastName || ""}`.toLowerCase();
    const vehicleTitle = conv.listingId?.title?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || vehicleTitle.includes(q);
  });

  return (
    <div className={`w-full md:w-80 lg:w-96 bg-[#111b21] border-r border-gray-800 flex flex-col h-full ${activeConversationId ? "hidden md:flex" : "flex"}`}>
      {/* Header */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-gray-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-sm uppercase">
            {user?.firstName ? user.firstName[0] : "U"}
          </div>
          <div>
            <h2 className="text-gray-100 font-semibold text-sm">Chats</h2>
            <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-[#111b21]">
        <div className="bg-[#2a3942] rounded-lg px-3 py-1.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 fill-current" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-gray-200 placeholder-gray-400 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
        {isLoadingConversations ? (
          <div className="p-6 text-center text-gray-400 text-xs animate-pulse">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partner = getOtherParticipant(conv);
            const partnerId = partner?._id || partner;
            const isOnline = onlineUsers[partnerId]?.isOnline;
            const unread = unreadCounts[conv._id] || 0;
            const isActive = activeConversationId === conv._id;

            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversationId(conv._id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#2a3942]"
                    : "hover:bg-[#202c33]"
                }`}
              >
                {/* Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-700 text-gray-200 flex items-center justify-center font-bold text-base uppercase">
                    {partner?.firstName ? partner.firstName[0] : partner?.role === "vendor" ? "S" : "U"}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-gray-100 text-sm font-medium truncate">
                      {partner?.firstName
                        ? `${partner.firstName} ${partner.lastName || ""}`.trim()
                        : partner?.role === "vendor"
                        ? "Seller"
                        : "User"}
                    </h3>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {formatTime(conv.updatedAt || conv.lastMessage?.createdAt)}
                    </span>
                  </div>

                  {/* Vehicle context title */}
                  {conv.listingId && (
                    <p className="text-[11px] text-cyan-400 truncate mb-0.5">
                      🚗 {conv.listingId.title || `${conv.listingId.make} ${conv.listingId.model}`}
                    </p>
                  )}

                  {/* Last Message Preview & Unread Count */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate flex-1">
                      {conv.lastMessage?.isDeleted
                        ? "This message was deleted"
                        : conv.lastMessage?.type === "image"
                        ? "📷 Photo"
                        : conv.lastMessage?.type === "audio"
                        ? "🎙️ Voice message"
                        : conv.lastMessage?.content || "No messages yet"}
                    </p>

                    {unread > 0 && (
                      <span className="ml-2 bg-[#00a884] text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
