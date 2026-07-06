const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function withdrawalUpdateTemplate({ firstName, status, amount, reason, lang = "en" }) {
  const keyMap = {
    approved: "email.withdrawalUpdate.approved",
    paid: "email.withdrawalUpdate.paid",
    rejected: "email.withdrawalUpdate.rejected",
  };

  const baseKey = keyMap[status] || "email.withdrawalUpdate.approved";
  const heading = t(`${baseKey}.heading`, lang);
  const body = t(`${baseKey}.body`, lang, { amount, reason });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t(`${baseKey}.subject`, lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: `${process.env.FRONTEND_URL}/dashboard/wallet`,
      ctaText: lang === "fr" ? "Voir le portefeuille" : "View wallet",
      lang,
    }),
  };
}

module.exports = { withdrawalUpdateTemplate };