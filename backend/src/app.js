const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const { generalLimiter } = require("./middleware/rateLimiter.middleware");
const errorHandler       = require("./middleware/errorHandler.middleware");
const logger             = require("./config/logger");

// ── Route imports ──
const authRoutes    = require("./routes/auth/auth.routes");
const userRoutes    = require("./routes/user/user.routes");
const makeRoutes    = require("./routes/make/make.routes");
const modelRoutes   = require("./routes/model/model.routes");
const listingRoutes = require("./routes/listing/listing.routes");
const offerRoutes   = require("./routes/offer/offer.routes"); // ← Sprint 3
const notificationRoutes = require("./routes/notification/notification.routes"); // ← Sprint 4

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
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
app.post("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() })
);

// ── API Routes
app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/users",    userRoutes);
app.use("/api/v1/makes",    makeRoutes);
app.use("/api/v1/models",   modelRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/offers",   offerRoutes); // ← Sprint 3
app.use("/api/v1/notifications", notificationRoutes); // ← Sprint 4
// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last)
app.use(errorHandler);

module.exports = app;