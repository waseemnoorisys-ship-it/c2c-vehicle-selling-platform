function registerTypingHandlers(io, socket) {
    socket.on("typing", ({ conversationId }) => {
      const roomId = String(conversationId || "").trim();
      if (!roomId) return;

      socket.to(roomId).emit("user_typing", {
        conversationId: roomId,
        userId: socket.data.user._id,
        userName: socket.data.user.firstName,
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      const roomId = String(conversationId || "").trim();
      if (!roomId) return;

      socket.to(roomId).emit("user_stop_typing", {
        conversationId: roomId,
        userId: socket.data.user._id,
      });
    });
  }

  module.exports = { registerTypingHandlers };