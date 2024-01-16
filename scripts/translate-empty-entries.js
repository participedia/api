require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp, LOCALIZED_TEXT_BY_ID_LOCALE } = require("../api/helpers/db.js");
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
if (!keysEnvVar) {
  console.error('The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!');
  process.exit();
}
const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

// let languageList = ["en", "fr", "de", "es", "zh", "it", "pt", "nl"];
// *************************8
// not exist
//   SELECT Host FROM HostSoftware
// WHERE NOT EXISTS (
//     SELECT * FROM HostSoftware AS InnerSoftware
//     WHERE InnerSoftware.Host = HostSoftware.Host AND InnerSoftware.Software ='Title2'
// )
// *********************

async function processTranslation() {
  const LIMIT = process.env.LIMIT || 10; 
  console.log('*********** START PROCESSING ***********', LIMIT);
  // START DB QUERY
  try {
    const entries = await db.any(
      `
      SELECT localized_texts.thingid, localized_texts.title, localized_texts.language, localized_texts.body, things.id, things.original_language
      FROM (SELECT * FROM things WHERE things.original_language <> '' GROUP BY id, original_language) as things
      JOIN localized_texts ON things.id = localized_texts.thingid
      WHERE things.hidden = false AND things.published = true AND (
        localized_texts.title IS NULL OR localized_texts.title = ''
      )
      ORDER BY localized_texts.timestamp DESC LIMIT ${LIMIT}
      `
    );
  
    for (const entry of entries) {
  
      console.log(`---------- START process entry  ${entry.id} ----------`)
      if(!entry.title && !entry.body && !entry.description){
  
        let originEntry = null;
        if(!originEntry || originEntry.thingid !== entry.id){
          originEntry = await getOriginLanguageEntry(entry.id, entry.original_language);
        }
        
        if(!originEntry){
          console.log(`????????????????? Has no originEntry ?????????????? skip`)
          continue;
        }
        // get list of languages with same entry id
        let languageList = entries.map(item => { 
          if(item.id === entry.id && item.language) return item.language
        });
        console.log('languageList ', languageList)
        await translateEntry(languageList, entry.id, originEntry)
        
      } else {
        console.log(`????????????????? not all empty ?????????????? skip ${entry.id}`)
      }
  
    }
    console.log(`---------- DONE Translations --------------`)

    process.exit();
    
  } catch (error) {
    console.log('????????????????? catch error ?????????????? error', error)
  }

}

const translateEntry = async (languageList, entryId, originEntry) => {
  const langList = languageList.filter(el => el !== originEntry.language);

  for (let i = 0; i < langList.length; i++) {
    await timeout(5000);

    const item = {
      body: "",
      title: "",
      description: "",
      language: langList[i],
      thingid: entryId
    };


    item.body = await translateText(originEntry.body, langList[i]);
    item.title = await translateText(originEntry.title, langList[i]);
    item.description = await translateText(
      originEntry.description,
      langList[i]
    );

    const condition = pgp.as.format('WHERE thingid = ${thingid} AND language = ${language}', item);
    const update = await pgp.helpers.update(
      item,
      ["body", "title", "description", "language", "thingid"],
      "localized_texts"
    ) + condition;

    try {
      await db.none(update);
      console.log(`---------- Update entry id ${entryId} ---------- of language ${langList[i]}`)
      
    } catch (error) {
      console.log("error update", error);
    }
  }

  console.log(`---------- DONE the traslation entry id ${entryId} ---------- with languages ${langList}`)

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

const translateText = async (data, targetLanguage) => {
  // The text to translate
  let allTranslation = "";

  // The target language
  const target = targetLanguage;
  let length = data.length;
  if (length > 5000) {
    // Get text chunks
    let textParts = data.match(/.{1,5000}/g);
    for (let text of textParts) {
      let [translation] = await translate
        .translate(text, target)
        .catch(function(error) {
          console.log("error translate", error);
        });
      allTranslation += translation;
    }
  } else {
    [allTranslation] = await translate
      .translate(data, target)
      .catch(function(error) {
        console.log("error translate", error);
      });
  }
  return allTranslation;
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


processTranslation();
