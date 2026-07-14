function registerTypingHandlers(io, socket) {
    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
  
      socket.to(conversationId).emit("user_typing", {
        conversationId,
        userId: socket.data.user._id,
        userName: socket.data.user.firstName,
      });
    });
  
    socket.on("stop_typing", ({ conversationId }) => {
      if (!conversationId) return;
  
      socket.to(conversationId).emit("user_stop_typing", {
        conversationId,
        userId: socket.data.user._id,
      });
    });
  }
  
  module.exports = { registerTypingHandlers };