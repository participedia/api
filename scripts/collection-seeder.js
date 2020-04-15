const { db, pgp } = require("../api/helpers/db");
const sharedFieldOptions = require("./../api/helpers/shared-field-options.js");

run();

function run() {
  sharedFieldOptions['collections'].forEach(data => {
    db.any(`SELECT * FROM collections WHERE title = '${data}'`)
      .then(function(collection) {
        if (collection.length < 1) {
          saveRecord({title: data, type: 'collection', original_language: 'en'});
          console.log(`${data} saved`);
        }
      }
    ).catch(function(error) {
      console.log(error);
    });

  });
}

function saveRecord(records) {
  const insert = pgp.helpers.insert(records, ['title','type','original_language'], 'collections');
  db.none(insert);
}