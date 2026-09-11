const express = require("express");
const path = require("path");
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
const adminChatRoutes = require("./routes/admin/adminChat/adminChat.routes");
const ucpRoutes = require("./routes/ucp/ucp.routes");
const swaggerRoutes = require("./routes/swagger/swagger.routes");
const newsletterRoutes = require("./routes/newsletter/newsletter.routes");
const app = express();
app.set("trust proxy", 1);

// ── Security headers (Disable CSP so Swagger UI CDN scripts & inline setup can run)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5501",
      "https://c2c-vehicle-selling-platform.vercel.app",
      "*",
    ],
    credentials: true,
  }),
);

// ── Body parsers (Preserve rawBuffer on req.rawBody for Stripe signature verification)
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
// ── HTTP request logger
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);
// ── Global rate limiter
app.use("/api", generalLimiter);
// ── Swagger documentation UI
app.use("/api-docs", swaggerRoutes);
// ── Health check
app.all("/health", (req, res) =>
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
app.use("/api/v1/admin/chat", adminChatRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use(ucpRoutes);
app.get("/payment/success", async (req, res) => {
  const { session_id, transaction_id } = req.query;
  if (session_id && session_id.startsWith("cs_")) {
    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const paymentService = require("./services/payment/payment.service");
      const listingService = require("./services/listing/listing.service");
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session && (session.payment_status === "paid" || session.status === "complete")) {
        const transId = session.metadata?.transactionId || transaction_id;
        let trans = transId ? await paymentService.findTransactionById(transId) : null;
        if (!trans) trans = await paymentService.findTransactionByIntentId(session.id);
        if (trans && trans.status !== "escrowed" && trans.status !== "released") {
          await paymentService.updateTransactionById(trans._id, {
            status: "escrowed",
            stripePaymentStatus: "paid",
            escrowedAt: new Date(),
          });
          if (trans.listingId) {
            await listingService.updateListingById(trans.listingId, { status: "sold" });
          }
        }
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }
  res.sendFile(path.join(__dirname, "..", "payment-success.html"));
});

app.get("/payment/cancel", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "payment-cancel.html"));
});

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
// ── Global error handler (must be last)
app.use(errorHandler);
module.exports = app;

