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
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  // SMTP_HOST=sandbox.smtp.mailtrap.io
  // SMTP_PORT=2525
  // SMTP_USER=45c286ed506c11
  // SMTP_PASS=329c4331fa4223
  // EMAIL_FROM=hello@demomailtrap.co
  // EMAIL_FROM_NAME=C2C Vehicles
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  //Port 587 → secure: false → STARTTLS
  //Port 465 → secure: true  → SSL/TLS
  secure: false, // false for port 587 (STARTTLS), true for 465
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
