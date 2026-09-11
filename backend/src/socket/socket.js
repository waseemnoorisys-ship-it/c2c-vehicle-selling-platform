const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user/user.model");
const logger = require("../config/logger");
const { registerMessageHandlers } = require("./handlers/message.handler");
const { registerTypingHandlers } = require("./handlers/typing.handler");
const { registerPresenceHandlers } = require("./handlers/presence.handler");

const onlineUsers = new Map();

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      // Allow frontend URL and local HTML tester (file:// / null origin)
      origin: (origin, callback) => callback(null, true),
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      const token = typeof rawToken === "string" ? rawToken.trim() : rawToken;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch {
        return next(new Error("Invalid or expired token"));
      }

      // JWT payload uses `userId` (see auth.controller signAccessToken)
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return next(new Error("Invalid token payload"));
      }

      const user = await User.findOne({
        _id: userId,
        isActive: true,
        deletedAt: null,
      }).select("firstName lastName role fcmToken language");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      logger.error("Socket auth error", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${user.firstName} (${user._id})`);

    socket.join(user._id.toString());
    onlineUsers.set(user._id.toString(), {
      socketId: socket.id,
      lastSeen: new Date(),
      isOnline: true,
    });

    socket.broadcast.emit("user_online", { userId: user._id });

    registerPresenceHandlers(io, socket, onlineUsers);
    registerTypingHandlers(io, socket);
    registerMessageHandlers(io, socket, onlineUsers);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${user.firstName} (${user._id})`);

      onlineUsers.set(user._id.toString(), {
        socketId: null,
        lastSeen: new Date(),
        isOnline: false,
      });

      socket.broadcast.emit("user_offline", {
        userId: user._id,
        lastSeen: new Date(),
      });
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };
