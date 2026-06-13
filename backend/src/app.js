const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const { generalLimiter } = require("./middleware/rateLimiter.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");
const logger       = require("./config/logger");

// Route imports
const authRoutes   = require("./routes/auth/auth.routes");

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logger
app.use(morgan("dev", {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Global rate limiter
app.use("/api", generalLimiter);

// ── Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── API Routes
app.use("/api/v1/auth", authRoutes);

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last)
app.use(errorHandler);

module.exports = app;