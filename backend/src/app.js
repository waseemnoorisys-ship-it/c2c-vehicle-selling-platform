const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { generalLimiter } = require("./middleware/rateLimiter.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");
const logger = require("./config/logger");
// ── Route imports ──
const authRoutes = require("./routes/auth/auth.routes");
const userRoutes = require("./routes/user/user.routes");
const makeRoutes = require("./routes/make/make.routes");
const modelRoutes = require("./routes/model/model.routes");
const listingRoutes = require("./routes/listing/listing.routes");
const offerRoutes = require("./routes/offer/offer.routes"); // ← Sprint 3
const notificationRoutes = require("./routes/notification/notification.routes"); // ← Sprint 4
const paymentRoutes = require("./routes/payment/payment.routes"); // ← Sprint 5
const masterRoutes = require("./routes/master/master.routes");
const walletRoutes = require("./routes/wallet/wallet.routes"); //sprint 6
//admin routes requirements
const adminAuthRoutes = require("./routes/admin/adminAuth/adminAuth.routes");
const adminDashboardRoutes = require("./routes/admin/adminDashboard/adminDashboard.routes");
const adminUserRoutes = require("./routes/admin/adminUser/adminUser.routes");
const adminListingRoutes = require("./routes/admin/adminListing/adminListing.routes");
const adminCommissionRoutes = require("./routes/admin/adminCommission/adminCommission.routes");
//sprint 8 admin advance route requirements
const adminWithdrawalRoutes = require("./routes/admin/adminWithdrawal/adminWithdrawal.routes");
const adminTransactionRoutes = require("./routes/admin/adminTransaction/adminTransaction.routes");
const adminCmsRoutes = require("./routes/admin/adminCms/adminCms.routes");
const adminSettingsRoutes = require("./routes/admin/adminSettings/adminSettings.routes");
const adminAuditRoutes = require("./routes/admin/adminAudit/adminAudit.routes");
const cmsRoutes = require("./routes/cms/cms.routes");
const landingRoutes = require("./routes/landing/landing.routes");
const chatRoutes = require("./routes/chat/chat.routes");
const app = express();
app.set("trust proxy", 1);
//sprint 5 for strip webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/payments/webhook") {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});
// ── Security headers
app.use(helmet());
// ── CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
// ── Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// ── HTTP request logger
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);
// ── Global rate limiter
app.use("/api", generalLimiter);
// ── Health check
app.post("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);
// ── API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/makes", makeRoutes);
app.use("/api/v1/models", modelRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/offers", offerRoutes); // ← Sprint 3
app.use("/api/v1/notifications", notificationRoutes); // ← Sprint 4
app.use("/api/v1/payments", paymentRoutes); // ← Sprint 5
app.use("/api/v1/master", masterRoutes); //master
app.use("/api/v1/wallet", walletRoutes); //sprint 6
//ADMIN ROUTES
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/listings", adminListingRoutes);
app.use("/api/v1/admin/commission", adminCommissionRoutes);
//sprint 8 admin advance ROUTES
app.use("/api/v1/admin/withdrawals", adminWithdrawalRoutes);
app.use("/api/v1/admin/transactions", adminTransactionRoutes);
app.use("/api/v1/admin/cms", adminCmsRoutes);
app.use("/api/v1/admin/settings", adminSettingsRoutes);
app.use("/api/v1/admin/audit", adminAuditRoutes);
app.use("/api/v1/cms", cmsRoutes);
app.use("/api/v1/landing", landingRoutes);
app.use("/api/v1/chat", chatRoutes);
// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
// ── Global error handler (must be last)
app.use(errorHandler);
module.exports = app;

