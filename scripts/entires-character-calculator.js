require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp, LOCALIZED_TEXT_BY_ID_LOCALE, LOCALIZED_TEXT_BY_ID_LOCALE_NO_LIMIT } = require("../api/helpers/db.js");
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
if (!keysEnvVar) {
  console.error('The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!');
  process.exit();
}

let character = 0;
// npm run entires-character-calculator
async function processTranslation() {
  // const LIMIT = process.env.LIMIT || 10; 
  // console.log('*********** LIMIT ***********', LIMIT);
  // START DB QUERY
  try {
    const entries = await db.any(
      `
      SELECT localized_texts.thingid, localized_texts.title, localized_texts.language, localized_texts.body, things.id, things.original_language, localized_texts.timestamp
      FROM (SELECT * FROM things WHERE things.original_language <> '' GROUP BY id, original_language) as things
      JOIN localized_texts ON things.id = localized_texts.thingid
      WHERE things.hidden = false AND things.published = true AND (
        localized_texts.title IS NULL OR localized_texts.title = ''
      )
      AND localized_texts.timestamp > '2023-07-01'
      ORDER BY localized_texts.timestamp DESC
      `
    );
    console.log('*********** START PROCESSING *********** length ', entries.length);

    let originEntry = null;

    let count = 0;
    let countTranslated = 0;
    for (const entry of entries) {
      count++;
      
      console.log(`-------------------- START process entry  ${entry.id} ------------------ with entry language ${entry.language}`);
      console.log('****************************************************************************************************************');
      console.log('****************************************************************************************************************');
      if(!entry.title && !entry.body && !entry.description){
  
        if(!originEntry || originEntry.thingid !== entry.id){
          originEntry = null;
          originEntry = await getOriginLanguageEntry(entry.id, entry.original_language);
        }

        if(!originEntry || originEntry.language === entry.language){
          console.log(`????????????????? Has no originEntry ?????????????? skip ??????????`);
          continue;
        }

        //TODO
        // Check that entery already translate and has latest date
        const isTranslated = await getEntery(entry.id, entry.language, entry.timestamp);
        if(isTranslated){
          console.log(`${count} ++++++++++++++++++ is already translated +++++++++++++++ skip ${entry.id} ++++++ with language ${entry.language} ++++++`);
          continue;
        }
        console.log(`${count} ================ translate entry ${entry.id} =============== from language ${originEntry.language} to language ${entry.language}`)

        await translateEntry(entry.language, entry.id, originEntry);
        countTranslated++;
        
      } else {
        console.log(`????????????????? not all empty ?????????????? skip ${entry.id}`)
      }
      console.log('****************************************************************************************************************');
      console.log('****************************************************************************************************************');
    }
    console.log(`---------- DONE Translations -------------- ${countTranslated}`)
    console.log(`---------- DONE Translations Of Total Character-------------- ${character}`)

    process.exit();
    
  } catch (error) {
    console.log('????????????????? catch error ?????????????? error', error)
  }

}

const translateEntry = async (language, entryId, originEntry) => {
  let entryCharacters = 0;

  try {
    const item = {
      body: "",
      title: "",
      description: "",
      language: language,
      thingid: entryId
    };


    if(originEntry.body){
      const body = originEntry.body.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
      entryCharacters += body.length;
    }
    if(originEntry.title){
      entryCharacters += originEntry.title.length;
    }
    if(originEntry.description){
      const description = originEntry.description.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
      entryCharacters += description.length;
    }
    console.log(`!!!!!!!!!!!!!!!!!! the entry ${entryId} characters lenght is: !!!!!!!!! ${entryCharacters} !!!!!!!! `);

    character += entryCharacters;
    console.log(`^^^^^^^^^^^^^^^^^^^^^ Update entry id ${entryId} ^^^^^^^^^^^^^^^^^^^ of language ${language}`)
    
  } catch (error) {
    console.log("error update", error);
  }

  console.log(`******************** DONE the traslation entry id ${entryId} ********** with languages ${language}`)

  return true;

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

const getEntery = async (thingid, lang, timestamp) => {
  try {
    let results = await db.any(LOCALIZED_TEXT_BY_ID_LOCALE_NO_LIMIT, {
      thingid: thingid,
      language: lang,
      timestamp: timestamp,
    });
    return Array.isArray(results) && results.length ? results : false;
  } catch (err) {
    console.log("getEntery error - ", err);
  }
}


processTranslation();
