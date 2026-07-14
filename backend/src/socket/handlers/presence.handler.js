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
      if (!conversationId) return;
      socket.join(conversationId);
    });
  
    socket.on("leave_conversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(conversationId);
    });
  }
  
  module.exports = { registerPresenceHandlers };