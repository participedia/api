// cli usage

// start node console on heroku
// $ heroku run node  --app participedia-i18n-staging

// or locally (locally you will have to paste your .env vars exports in the terminal before running so the console can access them)
// $ node

// then require the script and run the function you want
// > var GenerateEntryI18n = require("/app/scripts/generate-entry-i18n.js");
// > GenerateEntryI18n.translateListOfEntries([{type: "case", id: 2}]);
require("dotenv").config();

// Get google translate credentials
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
if (!keysEnvVar) {
  throw new Error(
    "The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!"
  );
  return;
}

const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const { db, pgp } = require("../api/helpers/db");

const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);
function translateAllEntries(type, limit, skip) {
  getThings(type, limit, skip);
}

// translate a list of entries where entries is an array of objects [{ type: "case", id: 1 }]
function translateListOfEntries(entries) {
  entries.forEach(entry => {
    getThingById(entry.type, entry.id);
  });
}

function getThingById(type, id) {
  db.any(
    `SELECT * FROM things WHERE type = '${type}' AND id = '${id}' AND hidden = false`
  )
    .then(function(thingData) {
      thingData.forEach(data => {
        getLocalizationData(data.id, data.original_language);
      });
      return null;
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getThings(type, limit, skip) {
  db.any(
    // `SELECT * FROM things WHERE type = '${type}' AND hidden = false ORDER BY id DESC LIMIT ${limit} OFFSET ${skip}`
    `SELECT * FROM things WHERE type = '${type}' AND hidden = false`
  )
    .then(async function(thingData) {
      for (const data of thingData) {
        await getLocalizationData(data.id, data.original_language);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function getLocalizationData(thingid, language) {
  var results = await db.any(
    `SELECT * FROM localized_texts WHERE thingid = ${thingid} AND language = '${language}' ORDER BY timestamp DESC LIMIT 1`
  );

  for (const data of results) {
    await createNewRecord(data, thingid);
  }
}

async function createNewRecord(data, thingid) {
  const language = {
    twoLetterCode: "nl",
    name: "Dutch"
  };

  if (language.twoLetterCode !== data.language) {
    // Don't create language from original
    const item = {
      body: "",
      title: "",
      description: "",
      language: language.twoLetterCode,
      thingid: thingid,
      timestamp: "now",
    };

    if (data.body) {
      item.body = await translateText(data.body, language.twoLetterCode);
    }

    if (data.title) {
      item.title = await translateText(data.title, language.twoLetterCode);
    }

    if (data.description) {
      item.description = await translateText(
        data.description,
        language.twoLetterCode
      );
    }

    console.log(
      `ThingID: ${thingid} => saving record for ${language.twoLetterCode} from ${data.language}`
    );

    await saveRecord([item]).then(() => {
      console.log(
        `ThingID: ${thingid} => record for ${language.twoLetterCode} from ${data.language} DONE!`
      );
      console.log(`Title: ${item.title}`);
      console.log(
        "====================================================================="
      );
    });
  }
}

async function saveRecord(records) {
  const insert = pgp.helpers.insert(
    records,
    ["body", "title", "description", "language", "thingid", "timestamp"],
    "localized_texts"
  );
  db.none(insert);
}

async function translateText(data, targetLanguage) {
  // The text to translate
  let allTranslation = '';

  // The target language
  const target = targetLanguage;

  let textParts = data.match(/.{1,5000}/g);
  for(var text of textParts){
    let [translation] = await translate
      .translate(text, target)
      .catch(function(error) {
        console.log(error);
      });
    allTranslation += translation;
  }

  return allTranslation;
}

async function getListOfNonTranslatedEntries(type) {
  await db
    .any(
      `SELECT * FROM things WHERE type = '${type}' AND hidden = false ORDER BY id DESC`
    )
    .then(function(things) {
      things.forEach(async thing => {
        await db
          .any(`select * from localized_texts where thingid=${thing.id}`)
          .then(
            await function(records) {
              const hasTranslatedRecords =
                records.filter(record => {
                  return record.language === "es";
                }).length > 0;
              if (!hasTranslatedRecords) {
                // needs to be translated
                console.log(`{ type: "${type}", id: ${thing.id} },`);
              }
            }
          )
          .catch(function(error) {
            console.log(error);
          });
      });
      return null;
    })
    .catch(function(error) {
      console.log(error);
    });
}

module.exports = {
  translateAllEntries,
  translateListOfEntries,
  getListOfNonTranslatedEntries,
};

// const type = 'method';
// const fileName = 'method_filtered';
// const csvtojsonV2 = require("csvtojson/v2");
// const csvFilePath = `csvs/${fileName}.csv`;

// csvtojsonV2()
//   .fromFile(csvFilePath)
//   .then(jsonObj => {
//     const els = [];
//     const ids = jsonObj.map(el => el.ID);
//     const set = new Set(ids);
//     const elIDs = Array.from(set);
//     for (let i = 0; i < elIDs.length; i++) {
//       const elementID = elIDs[i];

//       els.push({
//         type,
//         id: elementID
//       })
//     }

// translateListOfEntries(els);
// });

// translateListOfEntries([{type: 'organization', id: 4684}])

translateAllEntries('method');
