import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const isLocalHost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("ngrok") ||
        window.location.hostname.includes("192.168."));

    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl && import.meta.env.VITE_API_URL) {
      socketUrl = import.meta.env.VITE_API_URL.replace("/api/v1", "");
    }
    if (!socketUrl || (!isLocalHost && socketUrl.includes("localhost"))) {
      socketUrl = isLocalHost
        ? "http://localhost:5000"
        : "https://c2c-vehicle-selling-platform.onrender.com";
    }

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Unable to emit event:", event);
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  joinConversation(conversationId) {
    if (!conversationId) return;
    this.emit("join_conversation", { conversationId });
  }

  leaveConversation(conversationId) {
    if (!conversationId) return;
    this.emit("leave_conversation", { conversationId });
  }

  sendMessage(conversationId, content, type = "text", replyTo = null) {
    const payload = { conversationId, content, type };
    if (replyTo) payload.replyTo = replyTo;
    this.emit("send_message", payload);
  }

  startTyping(conversationId) {
    this.emit("typing", { conversationId });
  }

  stopTyping(conversationId) {
    this.emit("stop_typing", { conversationId });
  }

  markRead(conversationId) {
    this.emit("mark_read", { conversationId });
  }

  getPresence(userId) {
    this.emit("get_presence", { userId });
  }
}

export const socketService = new SocketService();
export default socketService;
