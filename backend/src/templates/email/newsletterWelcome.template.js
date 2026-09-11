const { baseTemplate } = require("./base.template");

function newsletterWelcomeTemplate(data = {}) {
  const email = typeof data === "string" ? data : (data?.email || "");
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const unsubscribeUrl = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  
  const bodyHtml = `
    <p>Thank you for subscribing to the <strong>C2C Motors Newsletter</strong>!</p>
    <p>You will now receive the latest vehicle listings, market price updates, and exclusive buyer & seller tips delivered directly to your inbox.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#6b7280;">
      If you did not request this or wish to stop receiving updates, you can 
      <a href="${unsubscribeUrl}" style="color:#2563eb;text-decoration:underline;">unsubscribe at any time</a>.
    </p>
  `;

  return {
    subject: "Welcome to C2C Motors Newsletter 🚗",
    html: baseTemplate({
      heading: "Subscription Confirmed!",
      bodyHtml,
      ctaUrl: `${frontendUrl}/browse`,
      ctaText: "Explore Vehicle Listings",
    }),
  };
}

module.exports = { newsletterWelcomeTemplate };
