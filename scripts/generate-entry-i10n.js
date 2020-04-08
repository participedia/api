// Get google translate credentials
const keysEnvVar = process.env['GOOGLE_TRANSLATE_CREDENTIALS'];
if (!keysEnvVar) {
  throw new Error('The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!');
  return;
}

const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const { db, pgp } = require("../api/helpers/db");

const { Translate } = require('@google-cloud/translate').v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys['key'] = process.env.GOOGLE_MAPS_API_KEY;
const translate = new Translate(authKeys);

// getThings('case');
// getThings('method');
// getThings('organization');

// TEST PURPOSES
// getThings('case', 8);
// getThings('method', 6);
// getThings('organization', 6);

getThingById('case', '1');

function getThingById(type, id) {
  db.any(`SELECT * FROM things WHERE type = '${type}' AND id = '${id}'`)
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

function getThings(type, limit) {
  db.any(`SELECT * FROM things WHERE type = '${type}' ORDER BY id DESC LIMIT ${limit}`)
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

// function getThings(type) {
//   db.any(`SELECT * FROM things WHERE type = '${type}'`)
//     .then(function(thingData) {
//       thingData.forEach(data => {
//         getLocalizationData(data.id, data.original_language);
//       });
//       return null;
//     })
//     .catch(function(error) {
//       console.log(error);
//     });
// }

function getLocalizationData(thingid, language) {
  db.any(`SELECT * FROM localized_texts WHERE thingid = ${thingid} AND language = '${language}' ORDER BY timestamp DESC LIMIT 1`)
    .then(function(data) {
      data.forEach(data => {
        createNewRecord(data, thingid);
      });
      return null;
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function createNewRecord(data, thingid) {
  var currentLanguages = [];
  await db.any(`SELECT language FROM localized_texts WHERE thingid = ${thingid}`)
    .then(function(existingLanguages) {
      existingLanguages.forEach(lang => {
        currentLanguages.push(lang.language);
      });
    }
  ).catch(function(error) {
    console.log(error);
  });

  for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) { // Loop in supported languages
    const language = SUPPORTED_LANGUAGES[i];

    if (currentLanguages.indexOf(language.twoLetterCode) < 0) { // If language in loop not exist from currentLanguages. Add record
      if (language.twoLetterCode !== data.language) { // Don't create language from original
        const item = {
          body: '',
          title: '',
          description: '',
          language: language.twoLetterCode,
          thingid: thingid
        };

        if (data.body) {
          item.body = await translateText(data.body, language.twoLetterCode);
        }

        if (data.title) {
          item.title = await translateText(data.title, language.twoLetterCode);
        }

        if (data.description) {
          item.description = await translateText(data.description, language.twoLetterCode);
        }

        console.log(`ThingID: ${thingid} => saving record for ${language.twoLetterCode} from ${data.language}`);
        await saveRecord([item]);
        console.log(`ThingID: ${thingid} => record for ${language.twoLetterCode} from ${data.language} DONE!`);
        console.log(`ThingID: ${item.title}`);
        console.log('=====================================================================');
      }
    }
  }
}

async function saveRecord(records) {
  const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid'], 'localized_texts');
  db.none(insert);
}

async function translateText(data, targetLanguage) {
  // The text to translate
  const text = data;

  // The target language
  const target = targetLanguage;

  const [translation] = await translate.translate(text, target);
  return translation;
}