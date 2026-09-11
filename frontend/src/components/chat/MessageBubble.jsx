import React, { useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import chatApi from "../../api/chat.api";

export default function MessageBubble({ message, onImageClick, onReply }) {
  const { user } = useAuthStore();
  const { updateMessage, removeMessage } = useChatStore();
  
  const isOutgoing =
    (message.senderId?._id || message.senderId) === (user?._id || user?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || "");
  const [showMenu, setShowMenu] = useState(false);

  // Check if message is within 5 minutes for edit eligibility
  const createdDate = new Date(message.createdAt);
  const isWithinFiveMins = Date.now() - createdDate.getTime() < 5 * 60 * 1000;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      const res = await chatApi.editMessage(message._id, editText.trim());
      if (res.success && res.data?.message) {
        updateMessage(res.data.message);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit message:", err);
      alert(err.response?.data?.message || "Failed to edit message");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await chatApi.deleteMessage(message._id);
      removeMessage(message._id);
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert(err.response?.data?.message || "Failed to delete message");
    }
  };

  // Render ticks for outgoing messages
  const renderTicks = () => {
    if (!isOutgoing) return null;
    if (message.isRead) {
      return (
        <span className="text-cyan-400 text-xs font-bold ml-1">✓✓</span>
      );
    }
    return (
      <span className="text-gray-400 text-xs font-bold ml-1">✓</span>
    );
  };

  return (
    <div
      className={`flex my-1 px-4 ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative group max-w-[75%] sm:max-w-[65%] rounded-lg px-3 py-2 text-sm shadow-sm ${
          isOutgoing
            ? "bg-[#005c4b] text-gray-100 rounded-tr-none"
            : "bg-[#202c33] text-gray-100 rounded-tl-none"
        }`}
      >
        {/* Hover Reply Button */}
        {!message.isDeleted && (
          <button
            onClick={() => onReply && onReply(message)}
            className={`absolute top-2 ${
              isOutgoing ? "-left-7" : "-right-7"
            } opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-opacity bg-[#202c33] border border-gray-700/50`}
            title="Reply to message"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
          </button>
        )}

        {/* Action Menu Toggle for Outgoing Messages */}
        {isOutgoing && !message.isDeleted && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-300 hover:text-white p-1 rounded hover:bg-black/20"
              title="Message options"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-28 bg-[#233138] border border-gray-700 rounded shadow-lg z-20 py-1"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    onReply && onReply(message);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700"
                >
                  Reply
                </button>
                {message.type === "text" && isWithinFiveMins && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quoted Message Preview (if replyTo exists) */}
        {message.replyTo && (
          <div className="mb-2 p-2 rounded bg-black/25 border-l-4 border-[#00a884] text-xs">
            <span className="font-semibold text-[#00a884] block truncate">
              {message.replyTo.senderId?.firstName || "Replying to message"}
            </span>
            <p className="text-gray-300/90 truncate mt-0.5">
              {message.replyTo.type === "image"
                ? "📷 Photo"
                : message.replyTo.type === "audio"
                ? "🎙️ Voice message"
                : message.replyTo.content || "Message"}
            </p>
          </div>
        )}

        {/* Message Content */}
        {message.isDeleted ? (
          <p className="italic text-gray-400 text-xs py-0.5">
            This message was deleted
          </p>
        ) : isEditing ? (
          <div className="flex flex-col gap-2 my-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-[#111b21] text-white p-2 rounded text-xs border border-gray-600 focus:outline-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:text-white px-2 py-0.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="text-xs bg-[#00a884] text-white px-2 py-0.5 rounded hover:bg-[#00cf9d]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Image Content */}
            {message.type === "image" && (
              <div className="mb-1 rounded overflow-hidden cursor-pointer">
                <img
                  src={message.mediaUrl || message.content}
                  alt="Attachment"
                  className="max-h-60 w-full object-cover rounded hover:opacity-95 transition-opacity"
                  onClick={() =>
                    onImageClick && onImageClick(message.mediaUrl || message.content)
                  }
                />
              </div>
            )}

            {/* Audio Content */}
            {message.type === "audio" && (
              <div className="my-1">
                <audio
                  src={message.mediaUrl || message.content}
                  controls
                  className="w-full max-w-[240px] h-9 rounded"
                />
              </div>
            )}

            {/* Text Content */}
            {(message.type === "text" || !message.type) && (
              <p className="whitespace-pre-wrap break-words leading-relaxed pr-4">
                {message.content}
              </p>
            )}
          </>
        )}

        {/* Footer Meta (Timestamp + Edited Tag + Ticks) */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80">
          {message.isEdited && <span className="italic">edited</span>}
          <span>{formatTime(message.createdAt)}</span>
          {renderTicks()}
        </div>
      </div>
    </div>
  );
}
