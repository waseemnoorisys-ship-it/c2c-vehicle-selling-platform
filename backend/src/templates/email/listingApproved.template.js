const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function listingApprovedTemplate({ firstName, lang = "en" }) {
  const heading = t("email.listingApproved.heading", lang);
  const body = t("email.listingApproved.body", lang);
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.listingApproved.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/listings`,
      ctaText: lang === "fr" ? "Voir l'annonce" : "View listing",
      lang,
    }),
  };
}

module.exports = { listingApprovedTemplate };