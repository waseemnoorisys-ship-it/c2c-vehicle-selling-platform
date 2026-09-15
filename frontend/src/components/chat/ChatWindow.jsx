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

  const isListingSold = listing?.status === "sold" || activeConv?.isActive === false;

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

  const partnerRole = partner?.role || (activeConv?.vendorId?._id === partnerId || activeConv?.vendorId === partnerId ? "vendor" : "buyer");
  const partnerPhoto = partner?.profilePhoto;
  const presence = partnerId ? onlineUsers[partnerId] : null;

  return (
    <div className="flex-1 bg-[#0b141a] flex flex-col h-full relative">
      {/* Top Header Bar with Partner Profile & Online Status */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-gray-800/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setActiveConversationId(null)}
            className="md:hidden text-gray-400 hover:text-gray-200 pr-1"
            title="Back to chats"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>

          <div className="relative shrink-0">
            {partnerPhoto ? (
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border border-gray-700/80"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-sm uppercase shadow">
                {partnerName[0] || "U"}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202c33] ${
                isOnline ? "bg-emerald-500" : "bg-gray-500"
              }`}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-100 font-semibold text-sm truncate">
                {partnerName}
              </h3>
              {partnerRole && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase shrink-0 border border-emerald-500/30">
                  {partnerRole}
                </span>
              )}
            </div>
            <p className="text-xs truncate text-gray-400 mt-0.5 flex items-center gap-1">
              {isPartnerTyping ? (
                <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Online
                </span>
              ) : presence?.lastSeen ? (
                <span className="text-gray-400">
                  Last seen {new Date(presence.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Back to Home / Dashboard Button */}
        <button
          type="button"
          onClick={() => {
            const role = user?.role;
            if (role === "admin" || role === "super_admin") navigate("/admin/dashboard");
            else if (role === "vendor") navigate("/vendor/dashboard");
            else if (role === "buyer") navigate("/buyer/dashboard");
            else navigate("/");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-200 bg-[#2a3942] hover:bg-[#3b4a54] rounded-lg border border-gray-700/60 transition-colors shrink-0 shadow-sm cursor-pointer ml-3"
          title="Back to Home / Dashboard"
        >
          <svg className="w-4 h-4 fill-current text-emerald-400" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>

      {/* Sold Notice Banner */}
      {isListingSold && (
        <div className="bg-[#1f2937] border-b border-amber-500/40 px-4 py-2 flex items-center justify-between gap-3 shrink-0 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span>
              <strong>Vehicle Sold:</strong> This listing has been sold. This conversation is saved as a record, and new messages are disabled.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
            Sold / Closed
          </span>
        </div>
      )}
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
        isClosed={isListingSold}
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
