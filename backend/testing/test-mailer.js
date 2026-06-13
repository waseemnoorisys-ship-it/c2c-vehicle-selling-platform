// require("dotenv").config();
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host:   process.env.SMTP_HOST,
//   port:   Number(process.env.SMTP_PORT),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// async function test() {
//   try {
//     // Step 1: verify connection
//     await transporter.verify();
//     console.log("✅ SMTP connection OK");

//     // Step 2: send a real test email
//     const info = await transporter.sendMail({
//       from:    `"C2C Vehicles" <${process.env.EMAIL_FROM}>`,
//       to:      "anyemail@test.com",   // doesn't matter — Mailtrap catches it
//       subject: "Test OTP Email",
//       html: `
//         <h2>🚗 C2C Vehicles</h2>
//         <p>Your test OTP is:</p>
//         <h1 style="letter-spacing:10px">483921</h1>
//       `,
//     });

//     console.log("✅ Email sent! Message ID:", info.messageId);
//     console.log("👉 Open Mailtrap dashboard to see it");

//   } catch (err) {
//     console.error("❌ Failed:", err.message);
//     console.error("\n--- Troubleshooting ---");
//     console.error("1. Check SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
//     console.error("2. Make sure .env is in /backend folder");
//     console.error("3. Mailtrap free plan: sandbox.smtp.mailtrap.io port 587");
//   }
// }

// test();