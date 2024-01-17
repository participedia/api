require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp } = require("../api/helpers/db.js");

// npm run calculate-entires-character
async function processCalculator() {
  console.log('*********** START PROCESSING ***********');

  const entries = await db.any(
    `SELECT things.id, things.original_language
    FROM things,localized_texts
    WHERE things.id = localized_texts.thingid AND things.hidden = false AND things.published = true AND (
      localized_texts.title IS NULL OR localized_texts.title = ''
    )
    AND localized_texts.timestamp > '2023-07-01'
    GROUP BY things.id
    ORDER BY things.id DESC`
  );
  console.log(`-------------------- entries length is  ${entries.length}`);

  let characters = 0;
  for (const entry of entries) {
    console.log(`-------------------- START process entry  ${entry.id} ------------------ with entry language ${entry.language}`)
    originEntry = await getOriginLanguageEntry(entry.id, entry.original_language);
    let entryCharacters = 0;

    if(originEntry.title){
      characters += originEntry.title.length;
      entryCharacters += originEntry.title.length;
    }
    if(originEntry.description){
      characters += originEntry.description.length;
      entryCharacters += originEntry.description.length;
    }
    if(originEntry.body){
      characters += originEntry.body.length;
      entryCharacters += originEntry.body.length;
    }

    console.log(`***************** Calculate entry characters of ${entry.id} is: ${entryCharacters}*************** `);
  }

  console.log(`---------- DONE Calculattion Characters --------------`)
  process.exit();

}

processCalculator();