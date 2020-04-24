const { db, pgp, CREATE_COLLECTION, UPDATE_COLLECTION } = require("../api/helpers/db");
const sharedFieldOptions = require("./../api/helpers/shared-field-options.js");
const i18n = require("i18n");
i18n.configure({
  locales: ['en'],
  extension: ".js",
  directory: "./locales",
  updateFiles: false,
});
var initialCollections = [];

async function run() {
  db.any(`SELECT * FROM collections WHERE type = 'collection'`)
    .then(async function(collection) {
      if (collection.length < 1) {
        await saveCollection();
        await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
        console.log('REFRESH MATERIALIZED VIEW search_index_en');
        await updateEntries();
        await updateCollectionColumnDataType('methods');
        await updateCollectionColumnDataType('cases');
        await updateCollectionColumnDataType('organizations');
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
    let thing = await db.one(CREATE_COLLECTION, {title, body, description, original_language});
    await db.any(`UPDATE collections SET title = '${sharedFieldOptions['collections'][i]}' WHERE id = ${thing.thingid}`);
    console.log(`${title} - Added`);
  };
}

async function updateEntries() {
  await updateEntriesCollectionValue('methods');
  await updateEntriesCollectionValue('cases');
  await updateEntriesCollectionValue('organizations');
}

async function updateCollectionColumnDataType(table) {
  let query = `ALTER TABLE ${table} ALTER COLUMN collections DROP DEFAULT, ALTER COLUMN collections TYPE integer[] USING (collections::integer[])`;
  let result = await db.any(query);
}

async function updateEntriesCollectionValue(table) {
  const query = `SELECT collections, id FROM ${table} WHERE array_length(collections, 1) > 0`;
  const results = await db.any(query);
  for (var i = 0; i < results.length; i++) {
    await updateSingleEntry(results[i].collections, results[i].id, table);
  }
}

async function updateSingleEntry(entryCollections, entryCollectionId, table) {
  var collectionValue = [];
  for (var i = 0; i < entryCollections.length; i++) {
    let collection = await getCollections(entryCollections[i]);
    if (collection.title === entryCollections[i]) {
      collectionValue.push(collection.id);
    }
  }
  let query = `UPDATE ${table} SET collections = '{${collectionValue.toString()}}' WHERE id = ${entryCollectionId}`;
  let result = await db.any(query);
  console.log(query);
}

async function getCollections(title) {
  const query = `SELECT id,title FROM collections where title = '${title}'`;
  const result = await db.any(query);
  return result[0];
}

run();
