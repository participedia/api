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

const numData = -1;
const maxBatchSize = 25;
let currentBatched = 0;

detectLangauge = async str => {
  const resCases = await tt(numData, "case");
  const resOrg = await tt(numData, "organization");
  const resMethod = await tt(numData, "method");
  const resCollection = await tt(numData, "collections");

  const arr = [
    {
      fileName: "case",
      data: resCases,
      processed: comprehendIt(resCases),
    },
    {
      fileName: "organization",
      data: resOrg,
      processed: comprehendIt(resOrg),
    },
    {
      fileName: "method",
      data: resMethod,
      processed: comprehendIt(resMethod),
    },
    {
      fileName: "collections",
      data: resCollection,
      processed: comprehendIt(resCollection),
    },
  ];

  const lists = {};
  arr.forEach(el => {
    const flatList = [];
    el.processed.then(reslt => {
      console.log(el.fileName);
      reslt.map(ele => {
        if (ele.status === "fulfilled") {
          flatList.push(ele.value.ResultList.map(elem => elem.Languages[0]));
        }
      });
      lists[el.fileName] = flatList;
      const flattendList = flatList.flat().map((element, i) => {
        const returnedData = {
          ...el.data[i],
          ...element,
          languageDetected: element.LanguageCode,
        };
        delete returnedData["bodyString"];
        delete returnedData["LanguageCode"];
        return returnedData;
      });
      writeToCSVFile(
        flattendList,
        [
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
        el.fileName
      );
    });
    console.log(lists);
  });
  console.log(lists);
};

function chunkArr(arr, size) {
  const chunked = [];
  for (let i = 0; i < arr.length; i += size) {
    chunked.push(arr.slice(i, size + i));
  }
  return chunked;
}

async function comprehendIt(data) {
  const promises = [];
  const dataArr = chunkArr(data, maxBatchSize);
  dataArr.forEach(el => {
    let params = {
      TextList: el.map(el => el.bodyString),
    };
    promises.push(comprehend.batchDetectDominantLanguage(params).promise());
  });
  return Promise.allSettled(promises);
}

async function tt(count = 10, type = "case") {
  const { Client } = require("pg");
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const texts = [];
  query = `SELECT lt.body, lt.thingid, lt.language, t.original_language, t.type
  FROM localized_texts lt
  LEFT JOIN things t
  ON t.id = lt.thingid WHERE t.type = '${type}' ${
    count > -1 ? "LIMIT " + count : ""
  } `;

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
  const filePath = "csvs/" + filename + ".csv";
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    if (fs.existsSync(filePath)) {
      const parser = new Parser();
      const csv = parser.parse(data);
      fs.appendFileSync(filePath, "\n");
      fs.appendFileSync(filePath, csv);
    } else {
      fs.writeFileSync(filePath, csv);
    }
  } catch (err) {
    console.error(err);
  }
}

detectLangauge();
