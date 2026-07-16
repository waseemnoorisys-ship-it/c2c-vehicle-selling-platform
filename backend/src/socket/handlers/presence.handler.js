function registerPresenceHandlers(io, socket, onlineUsers) {
  socket.on("get_presence", ({ userId }) => {
    const presence = onlineUsers.get(userId?.toString());

    socket.emit("presence_data", {
      userId,
      isOnline: presence?.isOnline || false,
      lastSeen: presence?.lastSeen || null,
    });
  });

  socket.on("join_conversation", ({ conversationId }) => {
    const roomId = conversationId?.toString?.()?.trim?.() || String(conversationId || "").trim();
    if (!roomId) {
      socket.emit("error", { message: "conversationId required" });
      return;
    }

    socket.join(roomId);
    socket.emit("joined_conversation", { conversationId: roomId });
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    const roomId = conversationId?.toString?.()?.trim?.() || String(conversationId || "").trim();
    if (!roomId) return;
    socket.leave(roomId);
  });
}


module.exports = { registerPresenceHandlers };
