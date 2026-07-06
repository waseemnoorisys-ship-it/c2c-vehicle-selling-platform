const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function listingRejectedTemplate({ firstName, reason, lang = "en" }) {
  const heading = t("email.listingRejected.heading", lang);
  const body = t("email.listingRejected.body", lang, { reason });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.listingRejected.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/listings`,
      ctaText: lang === "fr" ? "Modifier l'annonce" : "Edit listing",
      lang,
    }),
  };
}

module.exports = { listingRejectedTemplate };