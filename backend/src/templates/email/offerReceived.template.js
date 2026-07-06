const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function offerReceivedTemplate({ firstName, amount, lang = "en" }) {
  const heading = t("email.offerReceived.heading", lang);
  const body = t("email.offerReceived.body", lang, { amount });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.offerReceived.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/offers`,
      ctaText: lang === "fr" ? "Voir l'offre" : "View offer",
      lang,
    }),
  };
}

module.exports = { offerReceivedTemplate };