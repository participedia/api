const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const { db, pgp } = require("../api/helpers/db");

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});

// getThings('case');
// getThings('method');
// getThings('organization');

// TEST PURPOSES
// getThings('case', 8);
// getThings('method', 6);
// getThings('organization', 6);

getThingById('case', '5729')

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

  var records = [];
  for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) { // Loop in supported languages
    const language = SUPPORTED_LANGUAGES[i];

    if (currentLanguages.indexOf(language.twoLetterCode) < 0) { // If language in loop not exist from currentLanguages. Add record
      if (language.twoLetterCode !== data.language) { // Don't create language from original
        console.log(`ThingID: ${thingid} => creating language for ${language.twoLetterCode} from ${data.language}`);
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

        records.push(item);
        console.log(item.title);
        console.log('=====================================================================');
      }
    }
  }

  if (records.length > 0) { // Save if new records has item.
    const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid'], 'localized_texts');

    db.none(insert)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

async function translateText(data, targetLanguage) {
  // The text to translate
  const text = data;

  // The target language
  const target = targetLanguage;

  const [translation] = await translate.translate(text, target);
  return translation;
}