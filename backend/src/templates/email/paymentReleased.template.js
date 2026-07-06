const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function paymentReleasedTemplate({ firstName, amount, lang = "en" }) {
  const heading = t("email.paymentReleased.heading", lang);
  const body = t("email.paymentReleased.body", lang, { amount });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.paymentReleased.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/wallet`,
      ctaText: lang === "fr" ? "Voir le portefeuille" : "View wallet",
      lang,
    }),
  };
}

module.exports = { paymentReleasedTemplate };