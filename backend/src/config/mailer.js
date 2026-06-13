// const nodemailer = require("nodemailer");

// // WHY: Single transporter instance reused across the app.
// // In production swap SMTP creds for SendGrid/SES etc.
// const transporter = nodemailer.createTransport({
//   host:   process.env.SMTP_HOST,
//   port:   Number(process.env.SMTP_PORT),
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// module.exports = transporter;

const nodemailer = require("nodemailer");
const logger     = require("./logger");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,        // false for port 587 (STARTTLS), true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup — tells you immediately if creds are wrong
transporter.verify((error) => {
  if (error) {
    logger.error("Mailer connection failed: " + error.message);
  } else {
    logger.info("Mailer ready ✓ (connected to SMTP)");
  }
});

module.exports = transporter;