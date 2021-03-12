const csvtojsonV2 = require("csvtojson/v2");
const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

let loadedCSV;
const lowScoreEntries = [];
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
let loadingCSV = false;

if (!keysEnvVar) {
  throw new Error(
    "The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!"
  );
  return;
}

function loadCsvAsJSON(fileName = "case") {
  const csvFilePath = `csvs/${fileName}.csv`;
  loadedCSV = null;
  loadingCSV = true;
  csvtojsonV2()
    .fromFile(csvFilePath)
    .then(
      jsonObj => {
        loadedCSV = jsonObj;
        loadingCSV = false;
      },
      err => {
        console.log("Loading CSV failed", err);
        loadingCSV = false;
      }
    );
}

function filterLowScoreEntries() {
  if (loadedCSV) {
    const filtered = jsonObj.filter((el, i) => {
      return Number(el.Score) < 0.9;
    });
    return filtered;
  }
  throw new Error("CSV entries not found");
}

async function saveRecord(records) {
  const insert = pgp.helpers.insert(
    records,
    ["body", "title", "description", "language", "thingid", "timestamp"],
    "localized_texts"
  );
  db.none(insert);
}

async function getRecordToTranslate(thingID, language) {
  await client.connect();
  const query = `SELECT * FROM localized_texts WHERE thingid = ${thingID} AND language = '${language}' ORDER BY timestamp DESC LIMIT 1`;
  return client.query(query).then(
    reslt => {
      reslt.rows[0];
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
