// Dependencies
require("dotenv").config();
const fs = require("fs");
const promise = require("bluebird");
const { Parser } = require("json2csv");
const { htmlToText } = require("html-to-text");
const AWS = require("aws-sdk");
const parses = require("pg-connection-string").parse;
const { Client } = require("pg");
const { delay } = require("bluebird");
const config = parses(process.env.DATABASE_URL);

const options = {
  promiseLib: promise,
  capSQL: true,
};

const pgp = require("pg-promise")(options);
let db = pgp(config);
let client;

const comprehend = new AWS.Comprehend({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Update to set maximum items to fetch from DB
const numData = -1;
// Maximum no of items to batch per request. Max is 25
const maxBatchSize = 25;

async function getUniqueThingIDs() {
  let query = `SELECT DISTINCT thingid FROM localized_texts${
    numData > -1 ? " LIMIT " + numData : ""
  }`;
  const reslt = await client.query(query);
  const uniqueIDs = reslt.rows.map(el => el.thingid);
  return uniqueIDs;
}

async function getLatestEntriesForIDs(uniqueIDs, type = "case") {
  const latestEntries = [];
  for (let index = 0; index < uniqueIDs.length; index++) {
    const elm = uniqueIDs[index];
    let uniqueQuery = `SELECT * FROM (SELECT DISTINCT on (lt."language") *, lt.ctid FROM localized_texts lt LEFT JOIN things t ON t.id = lt.thingid WHERE lt.thingid = ${elm} AND t.type = '${type}' AND t.published = true AND t.hidden = false ORDER BY lt.language, timestamp DESC) ta${
      numData > -1 ? " LIMIT " + numData : ""
    }`;
    const res = await client.query(uniqueQuery);
    latestEntries.push(
      ...res.rows.map(el => {
        let { id, body, description, title, ctid } = el;
        const uppercase = false;
        body = htmlToText(body, { uppercase });
        description = htmlToText(description, { uppercase });
        title = htmlToText(title, { uppercase });
        body = body.replace(/(\r\n|\n|\r)/gm, " ").substring(0, 300);
        description = description
          .replace(/(\r\n|\n|\r)/gm, " ")
          .substring(0, 300);
        return { body, description, title, id, ctid };
      })
    );
  }
  return latestEntries;
}

async function detectLanguages(entries) {
  let reslt = await batchDetectLanguages(entries);
  // reslt = flatten(reslt)
  reslt = reslt.map((el, i) => {
    if (!el.length) {
      return null;
    }
    const isNotEmptyBody = !entries[i][0].includes("{{###PLACEHOLDERTEXT###}}");
    const isNotEmptyDescription = !entries[i][1].includes(
      "{{###PLACEHOLDERTEXT###}}"
    );
    const isNotEmptyTitle = !entries[i][2].includes(
      "{{###PLACEHOLDERTEXT###}}"
    );

    return [
      isNotEmptyBody ? el[0].LanguageCode : null,
      isNotEmptyBody ? el[0].Score : null,
      isNotEmptyDescription ? el[1].LanguageCode : null,
      isNotEmptyDescription ? el[1].Score : null,
      isNotEmptyTitle ? el[2].LanguageCode : null,
      isNotEmptyTitle ? el[2].Score : null,
    ];
  });
  return reslt;
}

function batchDetectLanguages(entries) {
  const batchedEntries = entries;
  const detectedLanguagesPromisified = [];

  for (let j = 0; j < batchedEntries.length; j++) {
    const TextList = batchedEntries[j];
    let params = {
      TextList,
    };
    if (!params.TextList.length) {
      continue;
    }
    detectedLanguagesPromisified.push(
      new Promise((resolve, reject) =>
        comprehend.batchDetectDominantLanguage(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            resolve([]);
          } else {
            const reslt = data.ResultList.map(el => el.Languages[0]);
            resolve(reslt);
          }
        })
      )
    );
  }
  return Promise.all(detectedLanguagesPromisified);
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
      csv = csv.replace(`"${fields.join('","')}"\n`, "");

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

// const fileName = 'organization'
// const csvtojsonV2 = require("csvtojson/v2");
// const csvFilePath = `csvs/${fileName}.csv`;

// csvtojsonV2()
//   .fromFile(csvFilePath)
//   .then(jsonObj => {
//     const els = [];
//     const filtered = jsonObj.filter((el, i) => {
//       if (el.languageDetected !== el.language) {
//         els.push(jsonObj[i]);
//         return true;
//       }
//     });
//     writeToCSVFile(filtered, null, null, `${fileName}_filtered`);
//   });

// getUniqueIDs();

async function runDetector(type = "case") {
  client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const uniqueIDs = await getUniqueThingIDs();
  const latestEntries = await getLatestEntriesForIDs(uniqueIDs);
  const arrayedEntries = [];
  for (let k = 0; k < latestEntries.length; k++) {
    const { body, description, title } = latestEntries[k];
    const entryAsArray = [
      body || "{{###PLACEHOLDERTEXT###}}",
      description || "{{###PLACEHOLDERTEXT###}}",
      title || "{{###PLACEHOLDERTEXT###}}",
    ];
    arrayedEntries.push(entryAsArray);
  }
  const detectedLanguages = await detectLanguages(arrayedEntries);
  for (let n = 0; n < detectedLanguages.length; n++) {
    detectedLanguages[n].unshift(latestEntries[n].id);
    detectedLanguages[n].push(latestEntries[n].ctid);
    const detectedEntry = {
      "Thing ID": detectedLanguages[n][0],
      "Body Language Detected": detectedLanguages[n][1],
      "Body Language Score": detectedLanguages[n][2],
      "Description Language Detected": detectedLanguages[n][3],
      "Description Language Score": detectedLanguages[n][4],
      "Title Language Detected": detectedLanguages[n][5],
      "Title Language Score": detectedLanguages[n][6],
      CTID: detectedLanguages[n][7],
    };
    writeToCSVFile(
      detectedEntry,
      [
        "Thing ID",
        "Body Language Detected",
        "Body Language Score",
        "Description Language Detected",
        "Description Language Score",
        "Title Language Detected",
        "Title Language Score",
        "CTID",
      ],
      [
        "Thing ID",
        "Body Language Detected",
        "Body Language Score",
        "Description Language Detected",
        "Description Language Score",
        "Title Language Detected",
        "Title Language Score",
      ],
      type
    );
    await delay(150);
  }

  client.end();
  console.info("End of script");
}

runDetector();
