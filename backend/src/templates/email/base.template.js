function baseTemplate({ heading, bodyHtml, ctaUrl, ctaText, lang }) {
    const footer =
      lang === "fr"
        ? "Vous recevez cet e-mail car vous êtes inscrit sur C2C Véhicules."
        : "You are receiving this email because you are registered on C2C Vehicles.";
  
        //what is cta full form and what is it ?
        //cta full form is call to action and it is a button that the user can click to go to the next page
        //what is cta text and what is it ?
        //cta text is the text that is displayed on the button
        //what is cta url and what is it ?
        //cta url is the url that the user will be redirected to when they click the button
        //what is lang and what is it ?
        //lang is the language of the email
        //what is heading and what is it ?
        //heading is the heading of the email
    const cta =
      ctaUrl && ctaText
        ? `<div style="text-align:center;margin:32px 0;">
             <a href="${ctaUrl}"
                style="background:#1D9E75;color:#ffffff;padding:12px 28px;
                       border-radius:6px;text-decoration:none;font-size:15px;
                       font-weight:600;display:inline-block;">
               ${ctaText}
             </a>
           </div>`
        : "";
  
    return `<!DOCTYPE html>
  <html lang="${lang || "en"}">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f4f4f4;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:8px;
                        overflow:hidden;border:1px solid #e0e0e0;">
            <tr>
              <td style="background:#1D9E75;padding:24px 32px;">
                <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                  C2C Vehicles
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">
                  ${heading}
                </h1>
                <div style="font-size:15px;color:#444444;line-height:1.7;">
                  ${bodyHtml}
                </div>
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="background:#f9f9f9;padding:16px 32px;
                         border-top:1px solid #e0e0e0;">
                <p style="margin:0;font-size:12px;color:#999999;">
                  ${footer}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
  }
  
  module.exports = { baseTemplate };