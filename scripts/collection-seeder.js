const { db, pgp, CREATE_COLLECTION } = require("../api/helpers/db");
const sharedFieldOptions = require("./../api/helpers/shared-field-options.js");

run();

async function run() {
  sharedFieldOptions['collections'].forEach(title => {
    db.any(`SELECT * FROM collections WHERE title = '${title}'`)
      .then(async function(collection) {
        if (collection.length < 1) {
          let body = "";
          let description = "";
          let original_language = "en";

          const thing = await db.one(CREATE_COLLECTION, {title, body, description, original_language});
        } else {
          console.log('dont create');
        }
      }
    ).catch(function(error) {
      console.log(error);
    });
  });
}