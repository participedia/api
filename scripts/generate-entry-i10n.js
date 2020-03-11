const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const { db, pgp } = require("../api/helpers/db");

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});

getThings();

function getThings() {
  db.any(`SELECT * FROM things WHERE type IN ('case','method','organization')`)
    .then(function(thingData) {
      thingData.forEach(data => {
        getLocalizationData(data.id);
      });
      return null;
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getLocalizationData(thingid) {
  db.any(`SELECT * FROM localized_texts WHERE thingid = ${thingid} ORDER BY timestamp DESC LIMIT 1`)
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
  var records = [];
  for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    const language = SUPPORTED_LANGUAGES[i];

    if (language.twoLetterCode !== data.language) {
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
    }
  }

  const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid'], 'localized_texts');

  db.none(insert)
    .then(function(data) {
      console.log(data);
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function translateText(data, targetLanguage) {
  // The text to translate
  const text = data;

  // The target language
  const target = targetLanguage;

  const [translation] = await translate.translate(text, target);
  return translation;
}