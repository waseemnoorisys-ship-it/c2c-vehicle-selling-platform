const en = require("../locales/en.json");
const fr = require("../locales/fr.json");

const locales = { en, fr };

// t("keyPath","lang",data.values)
// t("auth.welcome","en",{name:"Shoaib"})
function t(keyPath, lang, data) {
  const locale = locales[lang] || locales["en"];
  //suppose auth.loginSuccess
 //   after split [auth , longinSuccess]
  const keys = keyPath.split(".");
  let value = locale;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      const fallback = locales["en"];
      let fb = fallback;
      for (const k of keys) {
        if (fb && typeof fb === "object" && k in fb) {
          fb = fb[k];
        } else {
          return keyPath;
        }
      }
      value = fb;
      break;
    }
  }

  if (typeof value !== "string") return keyPath;

  if (data && typeof data === "object") {
    value = value.replace(/\${(\w+)}/g, (_, key) => {
      return data[key] !== undefined ? data[key] : `\${${key}}`;
    });
  }

  return value;
}

module.exports = { t };