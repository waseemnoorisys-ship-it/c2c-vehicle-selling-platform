import React, { useState } from "react";
import chatApi from "../../api/chat.api";

export default function BlockReportModal({
  isOpen,
  onClose,
  type, // "block" | "unblock" | "report"
  targetUserId,
  conversationId,
  partnerName,
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (type === "block") {
        await chatApi.blockUser(targetUserId);
        alert(`${partnerName} has been blocked.`);
      } else if (type === "unblock") {
        await chatApi.unblockUser(targetUserId);
        alert(`${partnerName} has been unblocked.`);
      } else if (type === "report") {
        if (!reason.trim()) {
          alert("Please provide a reason for reporting.");
          setIsSubmitting(false);
          return;
        }
        await chatApi.reportConversation(conversationId, reason.trim());
        alert("Conversation has been reported to administration.");
      }
      onClose();
    } catch (err) {
      console.error(`Failed to ${type}:`, err);
      alert(err.response?.data?.message || `Failed to ${type}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#202c33] text-gray-100 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
        <h3 className="text-lg font-bold mb-2 capitalize">
          {type} {partnerName ? `(${partnerName})` : ""}
        </h3>

        <form onSubmit={handleSubmit}>
          {type === "report" ? (
            <div className="my-4">
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Reason for report:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Fraud, inappropriate language, spam..."
                rows={3}
                className="w-full bg-[#111b21] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-[#00a884]"
                required
              />
            </div>
          ) : (
            <p className="text-sm text-gray-300 my-4">
              {type === "block"
                ? `Are you sure you want to block ${partnerName}? They will no longer be able to send you messages.`
                : `Are you sure you want to unblock ${partnerName}?`}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors disabled:opacity-50 ${
                type === "block" || type === "report"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-[#00a884] hover:bg-[#00cf9d]"
              }`}
            >
              {isSubmitting ? "Processing..." : type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
