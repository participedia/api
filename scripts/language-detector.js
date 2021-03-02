// Depencies
require("dotenv").config();
const fs = require("fs");
const promise = require("bluebird");
const { Parser } = require("json2csv");

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

const numData = 10;

detectLangauge = async str => {
  const resCases = await tt(numData, "case");
  const resOrg = await tt(numData, "organization");
  const resMethod = await tt(numData, "method");
  const resCollection = await tt(numData, "collections");

  const arr = [
    {
      fileName: "case",
      data: resCases,
    },
    {
      fileName: "organization",
      data: resOrg,
    },
    {
      fileName: "method",
      data: resMethod,
    },
    {
      fileName: "collections",
      data: resCollection,
    },
  ];

  arr.forEach(thing => {
    const TextList = thing.data.map(res => res.bodyString);
    const ids = thing.data.map(res => res.thingID);
    console.log(ids);
    var params = {
      TextList /* required */,
    };

    comprehend.batchDetectDominantLanguage(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        const cleanedData = data.ResultList.map((d, i) => {
          return {
            languageDetected: d.Languages.length
              ? d.Languages[0].LanguageCode
              : null,
            original_language: thing.data[i].original_language,
            language: thing.data[i].language,
            score: d.Languages[0].Score,
            thingID: thing.data[i].thingID,
          };
        });
        writeToCSVFile(
          cleanedData,
          [
            "languageDetected",
            "original_language",
            "language",
            "score",
            "thingID",
          ],
          [
            "Detected Language",
            "Original Language",
            "Language",
            "Confidence",
            "Thing ID",
          ],
          thing.fileName
        );
      }
    });
  });
};

async function tt(count = 10, type = "case") {
  const { Client } = require("pg");
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const texts = [];
  query = `SELECT lt.body, lt.thingid, lt.language, t.original_language, t.type
  FROM localized_texts lt
  LEFT JOIN things t
  ON t.id = lt.thingid WHERE t.type = '${type}' LIMIT ${count}`;

  return client.query(query).then(res => {
    for (let i = 0; i < res.rows.length; i++) {
      const data = res.rows[i];
      const bodyString = data.body.replace(/<[^>]*>?/gm, "").substring(0, 300);
      texts.push({
        bodyString,
        language: data.language,
        original_language: data.original_language,
        thingID: data.thingid,
      });
    }
    client.end();
    return Promise.resolve(texts);
  });
}

async function writeToCSVFile(data, fields, fieldNames, filename) {
  const opts = {
    fields,
    fieldNames,
  };
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    fs.writeFile("csvs/" + filename + ".csv", csv, res => {});
  } catch (err) {
    console.error(err);
  }
}

detectLangauge();
