require("dotenv").config();
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
const itemsToTranslate = 1;
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
  const { body, title, description, language } = record;
  const query = `UPDATE localized_texts lt SET lt.body = $1, lt.title = $2, lt.description = $3, lt.language = $4 WHERE id = ${record.id} RETURNING *`;
  client.query(query, [body, title, description, language], (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log("Updated: ", JSON.stringify(res.rows[0]));
      writeToCSVFile(res.rows[0]);
    }
  });
}

async function getRecordToCopy(thingID, language, detected_language) {
  const query = `SELECT * FROM localized_texts lt LEFT JOIN things t ON t.id = lt.thingid WHERE lt.thingid = ${thingID} AND lt.language = '${language}' AND lt.language != '${detected_language}' ORDER BY timestamp DESC LIMIT 1`;
  return client.query(query).then(
    reslt => {
      return reslt.rows[0];
    },
    err => console.log("Record fetch failed", err)
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

async function writeToCSVFile(data) {
  const opts = {
    fields: [
      "textSample",
      "languageDetected",
      "original_language",
      "language",
      "Score",
      "thingID",
    ],
    fieldNames: [
      "Detected Language",
      "Original Language",
      "Language",
      "Confidence",
      "Thing ID",
    ],
  };
  const filePath = "csvs/" + fileToWriteName + ".csv";
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

function copyEntry(entryData) {
  saveRecord(entryData);
}

client.connect().then(res => {
  loadCsvAsJSON(fileName).then(res => {
    filterHighScoreEntries();
    highScoreEntries
      .splice(0, itemsToTranslate || Infinity)
      .forEach((el, i) => {
        getRecordToCopy(
          el.thingID,
          el.original_language,
          el.languageDetected
        ).then(res => {
          // translateText(res.description || res.text, el.language);
          copyEntry(res);
        });
      });
  });
});
