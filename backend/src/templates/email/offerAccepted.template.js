const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function offerAcceptedTemplate({ firstName, amount, lang = "en" }) {
  const heading = t("email.offerAccepted.heading", lang);
  const body = t("email.offerAccepted.body", lang, { amount });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.offerAccepted.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/payments`,
      ctaText: lang === "fr" ? "Procéder au paiement" : "Proceed to payment",
      lang,
    }),
  };
}

module.exports = { offerAcceptedTemplate };