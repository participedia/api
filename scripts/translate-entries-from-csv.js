require("dotenv").config();
const fs = require("fs");
const { Parser } = require("json2csv");
const { htmlToText } = require("html-to-text");
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
const csvtojsonV2 = require("csvtojson/v2");
const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

let loadedCSV;
let highScoreEntries = [];
const lowScoreEntries = [];
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
let loadingCSV = false;
const itemsToTranslate = 50;
const fileName = "case";
const fileToWriteName = "case_report";

if (!keysEnvVar) {
  throw new Error(
    "The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!"
  );
  return;
}

function loadCsvAsJSON(fileName = "case_test") {
  const csvFilePath = `csvs/${fileName}.csv`;
  loadedCSV = null;
  loadingCSV = true;
  return csvtojsonV2()
    .fromFile(csvFilePath)
    .then(
      jsonObj => {
        loadedCSV = jsonObj;
        loadingCSV = false;
        return Promise.resolve();
      },
      err => {
        console.log("Loading CSV failed", err);
        loadingCSV = false;
        return Promise.reject();
      }
    );
}

function filterHighScoreEntries() {
  if (loadedCSV) {
    const filtered = loadedCSV.filter((el, i) => {
      return (
        Number(el.Score) > 0.9 &&
        el.language === el.original_language &&
        el.languageDetected !== el.language
      );
    });
    highScoreEntries = filtered;
    console.log(highScoreEntries);
    return filtered;
  }
  throw new Error("CSV entries not found");
}

async function saveRecord(record) {
  const { body, description, title } = record;
  const query = `UPDATE localized_texts SET body = $1, description = $2, title = $3 WHERE ctid = (SELECT ctid FROM localized_texts lt WHERE lt.thingid = ${record.id} AND lt.language = '${record.language}' ORDER BY timestamp DESC LIMIT 1) RETURNING *, ctid`;
  client.query(query, [body, description, title], (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.info("Updated data: ", JSON.stringify(res.rows[0]));
      const result = res.rows[0];
      writeToCSVFile({
        title: htmlToText((result.title || "").trim().substr(0, 200)),
        body: htmlToText((result.body || "").trim().substr(0, 200)),
        description: htmlToText(
          (result.description || "").trim().substr(0, 200)
        ),
        language: result.language,
        thingid: result.thingid,
      });
    }
  });
}

function getRecordToCopy(thingID, language, detected_language) {
  const query = `SELECT * FROM localized_texts lt LEFT JOIN things t ON t.id = lt.thingid WHERE lt.thingid = ${thingID} AND lt.language = '${language}' ORDER BY timestamp DESC LIMIT 1`;
  return client.query(query).then(
    reslt => {
      return Promise.resolve(reslt.rows[0]);
    },
    err => {
      console.log("Record fetch failed", err);
      return Promise.reject(err);
    }
  );
}

async function translateText(text, targetLanguage) {
  const target = targetLanguage;
  const [translation] = await translate
    .translate(text, target)
    .catch(function(error) {
      console.log(error);
    });
  return translation;
}

function writeToCSVFile(data) {
  const opts = {
    fields: ["title", "body", "description", "language", "thingid"],
    fieldNames: ["Title", "BOdy", "Description", "Language", "Thing ID"],
  };
  const filePath = "csvs/" + fileToWriteName + ".csv";
  try {
    let parser;
    let csv;
    if (fs.existsSync(filePath)) {
      parser = new Parser();
      csv = parser.parse(data);
      csv = csv.replace(
        '"title","body","description","language","thingid"\n',
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

async function runTranslations() {
  client.connect().then(res => {
    loadCsvAsJSON(fileName).then(async res => {
      filterHighScoreEntries();
      const filtered = highScoreEntries.splice(0, itemsToTranslate || Infinity);
      for (const el of filtered) {
        const record = await getRecordToCopy(
          el.thingID,
          el.original_language,
          el.languageDetected
        );
        const tText = await translateText(
          [record.title || "", record.body || "", record.description || ""],
          el.language
        );
        await saveRecord({
          id: record.id,
          language: record.language,
          title: tText[0],
          body: tText[1],
          description: tText[2],
        });
      }
      console.info("--------------------Done------------------");
    });
  });
}

runTranslations();
