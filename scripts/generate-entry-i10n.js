const promise = require("bluebird");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const pgp = require("pg-promise")(options);
const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const { db, CASE_BY_ID } = require("../api/helpers/db");

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});

// getThings();
getLocalizationData(5243);

function getThings() {
  db.any(`SELECT * FROM things WHERE type IN ('case','method','organization')`)
    .then(function(thingData) {
      thingData.forEach(data => {
        getLocalizationData(data.id);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getLocalizationData(thingid) {
  db.any(`SELECT * FROM localized_texts WHERE thingid = ${thingid} ORDER BY timestamp DESC LIMIT 1`)
    .then(function(data) {
      data.forEach(data => {
        console.log(data);
        var records = [];
        SUPPORTED_LANGUAGES.forEach(language => {
          // console.log(language);
          // if (language.twoLetterCode !== 'en') {
          //   // TODO: Implement google translate here
          //   records.push({
          //     body: 'test',
          //     title: 'test',
          //     description: 'test',
          //     language: language.twoLetterCode,
          //     thingid: thingid
          //   });
          // }
        });

        // const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid'], 'localized_texts');

        // db.none(insert)
        //   .then(function(data) {
        //     console.log(data);
        //   })
        //   .catch(function(error) {
        //     console.log(error);
        //   });
      });
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
  // console.log(`Text: ${text}`);
  // console.log(`Translation: ${translation}`);
  return translation;
}