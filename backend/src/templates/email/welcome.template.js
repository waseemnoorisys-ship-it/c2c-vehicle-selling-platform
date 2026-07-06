const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

//where from the firstName is coming?
//firstName is coming from the user model
function welcomeTemplate({ firstName, lang = "en" }) {
  const heading = t("email.welcome.heading", lang);
  const body = t("email.welcome.body", lang);
  const cta = t("email.welcome.cta", lang);

  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.welcome.subject", lang),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: process.env.FRONTEND_URL,
      ctaText: cta,
      lang,
    }),
  };
}

module.exports = { welcomeTemplate };