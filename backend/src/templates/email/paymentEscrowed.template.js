const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function paymentEscrowedTemplate({ firstName, lang = "en" }) {
  const heading = t("email.paymentEscrowed.heading", lang);
  const body = t("email.paymentEscrowed.body", lang);
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.paymentEscrowed.subject", lang),
    html: baseTemplate({ heading, bodyHtml, lang }),
  };
}

module.exports = { paymentEscrowedTemplate };