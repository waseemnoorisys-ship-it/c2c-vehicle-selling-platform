/**
 * Resolve response language for i18n.
 * Priority: authenticated user → body.language → Accept-Language → en
 */
function getLang(req) {
  if (req.user?.language) return req.user.language;
  if (req.admin?.language) return req.admin.language;
  if (req.body?.language && ["en", "fr"].includes(req.body.language)) {
    return req.body.language;
  }
  const header = req.headers?.["accept-language"];
  if (header) {
    const primary = String(header).split(",")[0].trim().slice(0, 2).toLowerCase();
    if (primary === "fr") return "fr";
  }
  return "en";
}

module.exports = { getLang };
