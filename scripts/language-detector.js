// Depencies
require("dotenv").config();
const fs = require("fs");
const promise = require("bluebird");
const { Parser } = require("json2csv");
const { htmlToText } = require("html-to-text");

const AWS = require("aws-sdk");
const parses = require("pg-connection-string").parse;

const config = parses(process.env.DATABASE_URL);

const options = {
  promiseLib: promise,
  capSQL: true,
};

const pgp = require("pg-promise")(options);
let db = pgp(config);

const comprehend = new AWS.Comprehend({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Update to set maximum items to fetch from DB
const numData = 100;
// Maximum no of items to batch per request. Max is 25
const maxBatchSize = 25;

async function comprehendIt(data) {
  const promises = [];
  const dataArr = chunkArr(data, maxBatchSize);
  dataArr.forEach(el => {
    let params = {
      TextList: el.map(el => el.bodyString).filter(elem => elem.length > 0),
    };
    promises.push(comprehend.batchDetectDominantLanguage(params).promise());
  });
  return Promise.allSettled(promises);
}

async function getUniqueIDs(type = "case") {
  const { Client } = require("pg");
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  let uniqueIDs = [];
  let query = `SELECT DISTINCT thingid FROM localized_texts${
    numData > -1 ? " LIMIT " + numData : ""
  }`;
  return client.query(query).then(res => {
    uniqueIDs = res.rows.map(el => el.thingid);
    uniqueIDs.forEach(elm => {
      let uniqueQuery = `SELECT DISTINCT on (lt."language") * FROM localized_texts lt LEFT JOIN things t ON t.id = lt.thingid WHERE lt.thingid = ${elm} AND t.type = '${type}' AND t.published = true AND t.hidden = false ${
        numData > -1 ? "LIMIT " + numData : ""
      }`;
      // console.log(uniqueQuery);
      return client.query(uniqueQuery).then(res => {
        const TextList = res.rows
          .map(el => {
            let bodyString = htmlToText(
              el.description && el.description.trim().length
                ? el.description
                : el.body || ""
            );
            bodyString = bodyString
              .replace(/(\r\n|\n|\r)/gm, " ")
              .substring(0, 300);
            return bodyString;
          })
          .filter(elem => elem.length > 0);
        // });
        let params = {
          TextList,
        };
        if (!params.TextList.length) {
          return;
        }
        comprehend.batchDetectDominantLanguage(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else {
            // console.log(Text.bodyString, data);
            const reslt = data.ResultList.map(el => el.Languages[0]);
            const formattedData = [];

            reslt.forEach((elem, i) => {
              formattedData.push({
                textSample: (res.rows[i].description &&
                res.rows[i].description.trim().length
                  ? res.rows[i].description
                  : res.rows[i].body || ""
                ).substring(0, 150),
                languageDetected: elem.LanguageCode,
                original_language: res.rows[i].original_language,
                language: res.rows[i].language,
                Score: elem.Score,
                thingID: elm,
              });
            });

            writeToCSVFile(
              formattedData,
              [
                "textSample",
                "languageDetected",
                "original_language",
                "language",
                "Score",
                "thingID",
              ],
              [
                "Detected Language",
                "Original Language",
                "Language",
                "Confidence",
                "Thing ID",
              ],
              type
            );
          }
        });
      });
    });
  });
}

async function comprehendText(Text, type = "case") {
  let params = {
    Text: Text.bodyString,
  };
  comprehend.detectDominantLanguage(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      console.log(Text.bodyString, data);
      const reslt = data.Languages[0];
      const formattedData = {
        textSample: Text.bodyString.substring(0, 150),
        languageDetected: reslt.LanguageCode,
        original_language: Text.original_language,
        language: Text.language,
        Score: reslt.Score,
        thingID: Text.thingID,
      };
      writeToCSVFile(
        formattedData,
        [
          "textSample",
          "languageDetected",
          "original_language",
          "language",
          "Score",
          "thingID",
        ],
        [
          "Detected Language",
          "Original Language",
          "Language",
          "Confidence",
          "Thing ID",
        ],
        type
      );
    }
  });
}

async function getDBData(type = "case") {
  const { Client } = require("pg");
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const texts = [];
  query = `SELECT lt.body, lt.description, lt.thingid, lt.language, t.original_language, t.type FROM localized_texts lt LEFT JOIN things t
  ON t.id = lt.thingid WHERE t.type = '${type}' AND t.published = true AND t.hidden = false ${
    numData > -1 ? "LIMIT " + numData : ""
  }`;

  return client.query(query).then(res => {
    for (let i = 0; i < res.rows.length; i++) {
      const data = res.rows[i];
      let bodyString = htmlToText(
        data.description && data.description.trim().length
          ? data.description
          : data.body || ""
      );
      bodyString = bodyString.replace(/(\r\n|\n|\r)/gm, " ").substring(0, 300);
      texts.push({
        bodyString,
        language: data.language,
        original_language: data.original_language,
        thingID: data.thingid,
      });
    }
    client.end();
    texts.forEach((text, i) => {
      comprehendText(text, type);
    });
    return Promise.resolve(texts);
  });
}

async function writeToCSVFile(data, fields, fieldNames, filename) {
  const opts = {
    fields,
    fieldNames,
  };
  const filePath = "csvs/" + filename + ".csv";
  try {
    let parser;
    let csv;
    if (fs.existsSync(filePath)) {
      parser = new Parser();
      csv = parser.parse(data);
      csv = csv.replace(
        '"textSample","languageDetected","original_language","language","Score","thingID"\n',
        ""
      );

      fs.appendFileSync(filePath, `\n${csv}`);
    } else {
      parser = new Parser(opts);
      csv = parser.parse(data);
      fs.writeFileSync(filePath, csv);
    }
  } catch (err) {
    console.error(err);
  }
}

// const csvtojsonV2 = require("csvtojson/v2");
// const csvFilePath = "csvs/organization.csv";

// csvtojsonV2()
//   .fromFile(csvFilePath)
//   .then(jsonObj => {
//     // console.log(jsonObj);
//     const els = [];
//     const filtered = jsonObj.filter((el, i) => {
//       if (el.languageDetected !== el.language) {
//         els.push(jsonObj[i]);
//         return true;
//       }
//     });
//     writeToCSVFile(filtered, null, "organization_filtered");
//   });

// const text = htmlToText(html, {
//   wordwrap: 130,
// });
// console.log(text);

// getSingleDBData(1041, "case");
// getDBData();
getUniqueIDs();
