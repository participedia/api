const promise = require("bluebird");
const { SUPPORTED_LANGUAGES } = require("./../constants.js");
const { find } = require("lodash");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const pgp = require("pg-promise")(options);
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
var db;
checkConnection();
getThings();

function checkConnection() {
  let config;
  try {
    config = parse(connectionString);
    if (process.env.NODE_ENV === "test" || config.host === "localhost") {
      config.ssl = false;
    } else {
      config.ssl = true;
    }
  } catch (e) {
    console.error("# Error parsing DATABASE_URL environment variable");
  }

  db = pgp(config);
}

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
        SUPPORTED_LANGUAGES.forEach(language => {
          if (language.twoLetterCode !== 'en') {
            console.log(`${data.title} Translate to ${language.twoLetterCode}`);
          }
        });
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}