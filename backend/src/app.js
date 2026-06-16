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
  //means it allows to send cookies , sessions , authorization headers from frontend -----to----- backend
  credentials: true,
}));

// ── Body parsers
//used for parsing json data from frontend like reactjs , angular , vuejs etc
app.use(express.json({ limit: "10mb" }));
//used for parsing form data from frontend like html form .because data looks like this [ email=john@gmail.com&password=123456]
//suppose i enter data in a from in which username:abcpassword:123 so it looks like this is header [send data to backend ] application/x-www-form-urlencoded
//so my backend is not understan it what they saying/parsing/giving data.like this its not json format .
//so backend tells frontend to send data in json format. because i understand json format.
//so frontend says use [express.urlencoded] so we give [unreadable data ] but you convert it into readble format and use it in your server and give me response.  
//USE CASE OF IT :
// Supports HTML forms
// Supports OAuth callbacks
// Supports Payment Gateway callbacks
// Supports Future Form Submissions
app.use(express.urlencoded({ extended: true }));//extended true means it allows to send nested objects and arrays.
//like user[name]=John..... user.name = john;
// user[email]=john@gmail.com...............user.email = john@gmail.com

// ── HTTP request logger
app.use(morgan("dev", {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Global rate limiter
app.use("/api", generalLimiter);

// ── Health check // checks if the server is running or alive
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