const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function offerRejectedTemplate({ firstName, amount, lang = "en" }) {
  const heading = t("email.offerRejected.heading", lang);
  const body = t("email.offerRejected.body", lang, { amount });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.offerRejected.subject", lang),
    html: baseTemplate({ heading, bodyHtml, lang }),
  };
}

module.exports = { offerRejectedTemplate };