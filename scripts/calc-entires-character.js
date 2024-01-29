require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp, LOCALIZED_TEXT_BY_ID_LOCALE } = require("../api/helpers/db.js");

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
  console.log(`&&&&&&&&&&&&&&&&& entries length is  ${entries.length} &&&&&&&&&&&&&&&&&`);

  let characters = 0;
  for (const entry of entries) {
    console.log(`-------------------- START process entry  ${entry.id} ------------------ with entry language ${entry.original_language}`)
    originEntry = await getOriginLanguageEntry(entry.id, entry.original_language);
    let entryCharacters = 0;

    if(originEntry.title){
      characters += originEntry.title.length;
      entryCharacters += originEntry.title.length;
    }
    if(originEntry.description){
      const description = originEntry.description.replace(/<[^>]+>/g, '');
      characters += description.length;
      entryCharacters += description.length;
    }
    if(originEntry.body){
      // blob base64
      // const body = originEntry.body.replace(/<[^>]+>/g, '');
      body = originEntry.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
      // const body = originEntry.replace(/<img src='data:image/jpeg;base64'[^>]*>/g,'');
      // replace(/^<img src="data:image\/[a-z]+;base64"/g, "")
      // strToReplace.replace(/^data:image\/[a-z]+;base64,/, "");
      // data:image/jpeg;base64,
      characters += body.length;
      entryCharacters += body.length;
    }

    console.log(`***************** the entry ${entry.id} characters lenght is: ***** ${entryCharacters}*************** `);
  }

  console.log(`#################### DONE Calculattion Characters #################3 result is: ${characters}`)
  process.exit();

}

const getOriginLanguageEntry = async (thingid, originLang) => {
  console.log(`---------- get origin language entry entry ${thingid} originLang ${originLang}----------`)

  try {
    let results = await db.one(LOCALIZED_TEXT_BY_ID_LOCALE, {
      thingid: thingid,
      language: originLang,
    });
    return results;
  } catch (err) {
    console.log("getOriginLanguageEntry error - ", err);
  }
};

processCalculator();