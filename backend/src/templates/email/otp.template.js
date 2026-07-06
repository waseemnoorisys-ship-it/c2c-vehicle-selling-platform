const { baseTemplate } = require("./base.template");
const { t } = require("../../utils/i18n");

function otpTemplate({ otp, minutes = 10, lang = "en" }) {
    //what is email.otp.heading?
    //email.otp.heading is the heading of the email
    //example of email.otp.heading is "Verify Your Email"
  const heading = t("email.otp.heading", lang);
  //what sis email.otp.body?
  //email.otp.body is the body of email
  //example of email.otp.body is "Please enter the code below to verify your email"
  const body = t("email.otp.body", lang, { minutes });
  //what is email.otp.footer?
  //email.otp.footer is the footer of the email
  //example of email.otp.footer is "If you did not request this verification, please ignore this email."
  //why we use lang there?
  //because we want to send the email in the language of the user
  const footer = t("email.otp.footer", lang);

  const bodyHtml = `
    <p>${body}</p>
    <div style="text-align:center;margin:28px 0;">
      <span style="display:inline-block;background:#f0faf6;border:2px dashed #1D9E75;
                   border-radius:8px;padding:16px 40px;font-size:32px;font-weight:700;
                   letter-spacing:8px;color:#1D9E75;">
        ${otp}
      </span>
    </div>
    <p style="font-size:13px;color:#888888;">${footer}</p>
  `;

  return {
    //what is email.otp.subject?
    //email.otp.subject is the subject of the email
    //example of email.otp.subject is "Verify Your Email"
    subject: t("email.otp.subject", lang),
    html: baseTemplate({ heading, bodyHtml, lang }),
  };
}

module.exports = { otpTemplate };