const transporter = require("../../config/mailer");
const logger      = require("../../config/logger");

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;

async function sendOtpEmail(toEmail, otp, type) {
  const isReset   = type === "password_reset";
  const subject   = isReset ? "Reset your password" : "Verify your email";
  const action    = isReset ? "reset your password" : "verify your email address";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#2563eb;">🚗 C2C Vehicles</h2>
      <p>Use the OTP below to ${action}. It expires in <strong>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;
                  padding:24px;background:#f0f9ff;border-radius:8px;margin:24px 0;">
        ${otp}
      </div>
      <p style="color:#6b7280;font-size:13px;">If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({ from: FROM, to: toEmail, subject, html });
    logger.info(`OTP email sent to ${toEmail} [${type}]`);
  } catch (err) {
    // Log but don't crash the request — email failure shouldn't block registration
    logger.error(`Failed to send OTP email to ${toEmail}: ${err.message}`);
  }
}

module.exports = { sendOtpEmail };