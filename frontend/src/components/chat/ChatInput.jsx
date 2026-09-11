import React, { useState, useRef, useEffect } from "react";
import socketService from "../../services/socket.service";
import chatApi from "../../api/chat.api";

const EMOJI_LIST = [
  "😀", "😂", "😍", "👍", "❤️", "🔥", "🎉", "🚗", 
  "🚘", "💰", "🙌", "💯", "🙏", "❌", "🤔", "👏", 
  "🏷️", "🔑", "⚙️", "✨", "🌟", "👋", "🤝", "📍", 
  "💬", "📱", "👌", "💡", "😎", "🤝", "🥳", "⚡"
];

export default function ChatInput({ conversationId, replyingTo, onCancelReply }) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Handle typing event dispatching
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (!conversationId) return;

    socketService.startTyping(conversationId);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketService.stopTyping(conversationId);
    }, 2000);
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = () => {
    if (!text.trim() || !conversationId) return;
    socketService.sendMessage(
      conversationId,
      text.trim(),
      "text",
      replyingTo?._id || null
    );
    socketService.stopTyping(conversationId);
    setText("");
    if (onCancelReply) onCancelReply();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Image Upload Handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);

      const res = await chatApi.uploadChatMedia(formData);
      if (res.success && res.data?.url) {
        socketService.sendMessage(
          conversationId,
          res.data.url,
          "image",
          replyingTo?._id || null
        );
        if (onCancelReply) onCancelReply();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert(err.response?.data?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Could not access microphone for voice recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (!conversationId) return;
    setIsUploading(true);
    try {
      const file = new File([audioBlob], "voice-message.webm", {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);

      const res = await chatApi.uploadChatMedia(formData);
      if (res.success && res.data?.url) {
        socketService.sendMessage(
          conversationId,
          res.data.url,
          "audio",
          replyingTo?._id || null
        );
        if (onCancelReply) onCancelReply();
      }
    } catch (err) {
      console.error("Failed to upload voice message:", err);
      alert("Voice message upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-[#202c33] border-t border-gray-700/50 relative">
      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="bg-[#111b21] px-4 py-2 flex items-center justify-between border-b border-gray-700/60 text-xs">
          <div className="flex items-center gap-2 min-w-0 border-l-4 border-[#00a884] pl-2">
            <span className="text-[#00a884] font-semibold">Replying to:</span>
            <span className="text-gray-300 truncate">
              {replyingTo.type === "image"
                ? "📷 Photo"
                : replyingTo.type === "audio"
                ? "🎙️ Voice message"
                : replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 shrink-0"
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-full left-4 mb-2 bg-[#233138] border border-gray-700 rounded-xl p-3 shadow-2xl z-50 w-72"
          onMouseLeave={() => setShowEmojiPicker(false)}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700 text-xs text-gray-300 font-semibold">
            <span>Select Emoji</span>
            <button onClick={() => setShowEmojiPicker(false)} className="hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
            {EMOJI_LIST.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="text-xl hover:bg-[#111b21] p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Action Bar */}
      <div className="px-4 py-3 flex items-center gap-2">
        {/* Hidden Image File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isRecording ? (
          /* Voice Recording UI Bar */
          <div className="flex-1 flex items-center justify-between bg-[#111b21] px-4 py-2 rounded-full text-red-400 text-sm">
            <div className="flex items-center gap-2 animate-pulse">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Recording... {formatRecordingTime(recordingTime)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={cancelRecording}
                className="text-gray-400 hover:text-gray-200 text-xs px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={stopRecording}
                className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#00cf9d]"
                title="Send Voice Message"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Regular Message Bar */
          <>
            {/* Emoji Toggle Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-yellow-400 p-2 rounded-full transition-colors text-lg leading-none"
              title="Emoji Picker"
            >
              😀
            </button>

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-gray-400 hover:text-gray-200 p-2 rounded-full transition-colors disabled:opacity-50"
              title="Attach Image"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
              </svg>
            </button>

            {/* Text Input */}
            <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center">
              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent text-gray-100 placeholder-gray-400 text-sm focus:outline-none resize-none max-h-24"
              />
            </div>

            {/* Action Button: Send or Voice Record */}
            {text.trim() ? (
              <button
                onClick={handleSendMessage}
                disabled={isUploading}
                className="bg-[#00a884] text-white p-2.5 rounded-full hover:bg-[#00cf9d] transition-colors disabled:opacity-50"
                title="Send Message"
              >
                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-200 p-2.5 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                title="Record Voice Message"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
