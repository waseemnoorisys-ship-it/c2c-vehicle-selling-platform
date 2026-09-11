import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import BlockReportModal from "./BlockReportModal";
import socketService from "../../services/socket.service";

export default function ChatWindow() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    typingUsers,
    onlineUsers,
    isLoadingMessages,
  } = useChatStore();

  const [previewImage, setPreviewImage] = useState(null);
  const [modalType, setModalType] = useState(null); // "block" | "unblock" | "report" | null
  const [showDropdown, setShowDropdown] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);

  const activeConv = conversations.find((c) => c._id === activeConversationId);

  const getOtherParticipant = (conv) => {
    if (!conv) return null;
    const currentUserId = (user?._id || user?.id)?.toString();
    const buyerId = (conv.buyerId?._id || conv.buyerId)?.toString();
    const vendorId = (conv.vendorId?._id || conv.vendorId)?.toString();

    if (currentUserId === buyerId) return conv.vendorId;
    if (currentUserId === vendorId) return conv.buyerId;

    if (conv.vendorId && vendorId !== currentUserId) return conv.vendorId;
    return conv.buyerId || conv.vendorId;
  };

  const partner = getOtherParticipant(activeConv);
  const partnerId = partner?._id || partner;
  const partnerName = partner
    ? `${partner.firstName || ""} ${partner.lastName || ""}`.trim() || (partner.role === "vendor" ? "Seller" : "Buyer")
    : "Chat Partner";
  const isOnline = partnerId ? onlineUsers[partnerId]?.isOnline : false;
  const activeTyping = activeConversationId ? typingUsers[activeConversationId] : [];
  const isPartnerTyping = activeTyping && activeTyping.length > 0;

  // Request presence for current partner on conversation select
  useEffect(() => {
    if (partnerId) {
      socketService.getPresence(partnerId);
    }
  }, [partnerId, activeConversationId]);

  // Vehicle summary banner variables
  const listing = typeof activeConv?.listingId === "object" ? activeConv.listingId : null;
  const vehicleTitle = listing
    ? listing.title || `${listing.year || ""} ${listing.makeId?.name || listing.make || ""} ${listing.modelId?.name || listing.model || ""}`.trim() || "Vehicle Listing"
    : "Vehicle Listing";
  const vehiclePrice = listing ? listing.price || listing.askingPrice : null;

  const getVehicleImageUrl = (l) => {
    if (!l) return null;
    const firstImg = l.images?.[0] || l.photos?.[0];
    if (!firstImg) return null;
    if (typeof firstImg === "string") return firstImg;
    if (typeof firstImg === "object") return firstImg.url || firstImg.secure_url || firstImg.path || null;
    return null;
  };
  const vehicleImg = getVehicleImageUrl(listing);
  const listingId = listing?._id || (typeof activeConv?.listingId === "string" ? activeConv.listingId : null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  if (!activeConversationId || !activeConv) {
    return (
      <div className="hidden md:flex flex-1 bg-[#0b141a] flex-col items-center justify-center text-center p-6 border-r border-gray-800/40">
        <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center text-[#00a884] mb-4">
          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </div>
        <h3 className="text-gray-200 font-semibold text-lg mb-1">
          C2C Vehicle Selling Platform Chat
        </h3>
        <p className="text-gray-400 text-xs max-w-sm">
          Select a conversation from the sidebar or contact a seller directly from a vehicle listing to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0b141a] flex flex-col h-full relative">
      {/* Header */}
      <div className="h-16 bg-[#202c33] px-3 sm:px-4 flex items-center justify-between border-b border-gray-800 shrink-0 z-10">
        {/* Partner Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveConversationId(null)}
            className="md:hidden p-1.5 -ml-1 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800"
            title="Back to chats"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-200 flex items-center justify-center font-bold text-sm uppercase">
              {partner?.firstName ? partner.firstName[0] : partner?.role === "vendor" ? "S" : "U"}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
            )}
          </div>

          <div>
            <h3 className="text-gray-100 font-semibold text-sm leading-tight">
              {partnerName}
            </h3>
            <span className="text-xs text-gray-400">
              {isPartnerTyping ? (
                <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
              ) : isOnline ? (
                <span className="text-[#00a884]">Online</span>
              ) : (
                "Offline"
              )}
            </span>
          </div>
        </div>

        {/* Right Actions Header (Vehicle details link + Options menu) */}
        <div className="flex items-center gap-3">
          {listingId && (
            <button
              onClick={() => navigate(`/vehicles/${listingId}`)}
              className="bg-[#2a3942] hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <span>🚗</span>
              <span className="max-w-[150px] truncate">
                {vehicleTitle}
              </span>
            </button>
          )}

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-[#2a3942] transition-colors"
              title="Options"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-44 bg-[#233138] border border-gray-700 rounded-lg shadow-xl py-1 z-30"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setModalType(partner?.isBlocked ? "unblock" : "block");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-[#111b21] transition-colors"
                >
                  {partner?.isBlocked ? "Unblock User" : "Block User"}
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setModalType("report");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-[#111b21] transition-colors"
                >
                  Report Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Small Vehicle Section Banner */}
      {listing && (
        <div className="bg-[#182229] border-b border-gray-800 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700/80 flex items-center justify-center">
              {vehicleImg ? (
                <img src={vehicleImg} alt={vehicleTitle} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base">🚗</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-gray-200 truncate">
                {vehicleTitle}
              </h4>
              <div className="flex items-center gap-2 text-[11px] mt-0.5">
                <span className="font-bold text-[#00a884]">
                  {vehiclePrice ? `$${Number(vehiclePrice).toLocaleString()}` : "Contact for Price"}
                </span>
                {listing.year && <span className="text-gray-400">• {listing.year}</span>}
              </div>
            </div>
          </div>
          {listingId && (
            <button
              type="button"
              onClick={() => navigate(`/vehicles/${listingId}`)}
              className="px-3 py-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs font-medium text-cyan-400 hover:text-cyan-300 border border-gray-700/60 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>🚗</span>
              <span>View Vehicle</span>
            </button>
          )}
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0b141a]/95">
        {isLoadingMessages ? (
          <div className="text-center text-gray-400 text-xs py-8 animate-pulse">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-12">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              onImageClick={(url) => setPreviewImage(url)}
              onReply={(m) => setReplyingTo(m)}
            />
          ))
        )}

        {/* Partner Typing Bubble */}
        {isPartnerTyping && (
          <div className="flex justify-start my-1 px-4">
            <div className="bg-[#202c33] text-gray-300 text-xs px-3 py-2 rounded-lg rounded-tl-none flex items-center gap-1.5 shadow">
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <ChatInput
        conversationId={activeConversationId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded"
          />
        </div>
      )}

      {/* Block / Report Modal */}
      <BlockReportModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType}
        targetUserId={partnerId}
        conversationId={activeConversationId}
        partnerName={partnerName}
      />
    </div>
  );
}
