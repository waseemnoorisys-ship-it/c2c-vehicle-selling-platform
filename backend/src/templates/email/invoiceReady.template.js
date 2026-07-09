const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function invoiceReadyTemplate({
  firstName,
  invoiceNumber,
  downloadUrl,
  role = "buyer",
  lang = "en",
}) {
  const bodyKey = role === "vendor" ? "email.invoiceReady.vendorBody" : "email.invoiceReady.buyerBody";
  const heading = t("email.invoiceReady.heading", lang);
  const body = t(bodyKey, lang, { invoiceNumber });
  const bodyHtml = `<p>Hi ${firstName},</p><p>${body}</p>`;

  return {
    subject: t("email.invoiceReady.subject", lang, { invoiceNumber }),
    html: baseTemplate({
      heading,
      bodyHtml,
      ctaUrl: downloadUrl,
      ctaText: t("email.invoiceReady.cta", lang),
      lang,
    }),
  };
}

module.exports = { invoiceReadyTemplate };
