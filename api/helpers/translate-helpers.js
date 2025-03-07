let { db, pgp } = require("../helpers/db");

const { getOriginLanguageEntry, getEntryByThingidAndLang } = require("../helpers/entries-helpers");

// Get google translate credentials
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
if (!keysEnvVar) {
  throw new Error(
    "The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!"
  );
  return;
}
const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

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
          logError(error);
        });
      allTranslation += translation;
    }
  } else {
    [allTranslation] = await translate
      .translate(data, target)
      .catch(function(error) {
        logError(error);
      });
  }
  return allTranslation;
};

const translateEntry = async (entryId, originLang) => {
  let languageList = ["en", "fr", "de", "es", "zh", "it", "pt", "nl"];
  let originEntry = await getOriginLanguageEntry(entryId, originLang);
  languageList = languageList.filter(el => el !== originEntry.language);
  let records = [];

  for (let i = 0; i < languageList.length; i++) {
    const item = {
      body: "",
      title: "",
      description: "",
      language: languageList[i],
      thingid: entryId,
      timestamp: "now",
    };
    
    item.body = await translateText(originEntry.body, languageList[i]);
    item.title = await translateText(originEntry.title, languageList[i]);
    item.description = await translateText(
      originEntry.description,
      languageList[i]
    );

    records.push(item);
  }

  const insert = pgp.helpers.insert(
    records,
    ["body", "title", "description", "language", "thingid", "timestamp"],
    "localized_texts"
  );

  db.none(insert)
    .then(function(data) {
      console.log(data);
    })
    .catch(function(error) {
      console.log(error);
    });

  return originEntry;
};

const processTranslateEntry = async (entryId, originLang) => {
  let languageList = ["en", "fr", "de", "es", "zh", "it", "pt", "nl"];
  let originEntry = await getOriginLanguageEntry(entryId, originLang);
  languageList = languageList.filter(el => el !== originEntry.language);
  let records = [];

  for (let i = 0; i < languageList.length; i++) {
    const lang = languageList[i];

    // if(originEntry.language !== lang){
      let entry = await getEntryByThingidAndLang(entryId, lang);
      // if not entry, translate and insert 
      if(!entry){

        const item = {
          body: "",
          title: "",
          description: "",
          language: languageList[i],
          thingid: entryId,
          timestamp: "now",
        };
        
        item.body = await translateText(originEntry.body, languageList[i]);
        item.title = await translateText(originEntry.title, languageList[i]);
        item.description = await translateText(
          originEntry.description,
          languageList[i]
        );
        
        records.push(item);

      } else if (entry && (entry.body === null || entry.description === null || entry.title === null)){

        const item = {
          body: "",
          title: "",
          description: "",
          language: languageList[i],
          thingid: entryId,
          timestamp: "now",
        };
        
        item.body = await translateText(originEntry.body, languageList[i]);
        item.title = await translateText(originEntry.title, languageList[i]);
        item.description = await translateText(
          originEntry.description,
          languageList[i]
        );
        
        records.push(item);
      }
  }

  if(records.length){
    const insert = pgp.helpers.insert(
      records,
      ["body", "title", "description", "language", "thingid", "timestamp"],
      "localized_texts"
    );
  
    db.none(insert)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(error) {
        console.log(error);
      });

  }


  return originEntry;
};

module.exports = exports = {
  translateText,
  translateEntry,
  processTranslateEntry,
};