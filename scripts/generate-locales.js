const path = require("path");
const fs = require("fs");
const i18n = require(path.resolve(__dirname, "..", "i18n.json"));

const locales = process.argv.slice(2);
locales.forEach((locale) => {
  const f = path.resolve(__dirname, "..", "i18n", locale + ".json");
  fs.writeFileSync(
    f,
    JSON.stringify(
      {
        ...i18n.reduce((object, message) => {
          object[message.id] = message.defaultMessage;
          return object;
        }, {}),
        ...(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : {}),
      },
      null,
      2
    )
  );
});
