const { db, pgp, CREATE_COLLECTION } = require("../api/helpers/db");
const sharedFieldOptions = require("./../api/helpers/shared-field-options.js");
const i18n = require("i18n");
i18n.configure({
  locales: ['en'],
  extension: ".js",
  directory: "./locales",
  updateFiles: false,
});

async function run() {
  db.any(`SELECT * FROM collections WHERE type = 'collection'`)
    .then(async function(collection) {
      if (collection.length < 1) {
        await saveCollection();
        await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
        console.log('REFRESH MATERIALIZED VIEW search_index_en');
      } else {
        console.log('migration already done.');
      }
    }
  ).catch(function(error) {
    console.log(error);
  });
}

async function saveCollection() {
  for (var i = 0; i < sharedFieldOptions['collections'].length; i++) {
    let body = "";
    let description = "";
    let original_language = "en";
    let title = i18n.__(`name:collections-key:${sharedFieldOptions['collections'][i]}`);

    await db.one(CREATE_COLLECTION, {title, body, description, original_language});
    console.log(`${title} - Added`);
  };
}

run();