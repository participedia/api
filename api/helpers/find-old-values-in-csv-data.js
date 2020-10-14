const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const sharedFieldOptions = require("./shared-field-options.js");

const sharedFieldOptionKeys = Object.keys(sharedFieldOptions);

const ACCEPTED_VALUES = sharedFieldOptionKeys
  .map(key => {
    return sharedFieldOptions[key];
  })
  .flat();
const IGNORED_VALUES = ["false", "true", "", null, "0", "1"];

const INPUT_CSV = "./participedia-data-organizations.csv";
const OUTPUT_CSV_PATH = "old-db-values-for-organizations.csv";

start();

function start() {
  findOldValues();
}

function uniqueArray(arr) {
  return arr.filter(
    (v, i, a) => a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
  );
}

function findOldValues() {
  const oldValues = [];

  const shouldSkip = (key, value) => {
    if (key === "number_of_participants") return true;
    if (IGNORED_VALUES.includes(value)) return true;
    if (ACCEPTED_VALUES.includes(value)) return true;
  };

  const addToOldValuesIfNeeded = (key, value) => {
    const shldSkip = shouldSkip(key, value);
    if (!shldSkip) {
      oldValues.push({
        field: key,
        value: value,
      });
    }
  };

  fs.createReadStream(INPUT_CSV)
    .pipe(csv())
    .on("data", row => {
      const columnKeys = Object.keys(row);
      columnKeys.forEach(key => {
        if (sharedFieldOptionKeys.includes(key)) {
          const value = row[key];
          if (value.includes(",")) {
            // if value is comma seprated list,
            // transform to array and add to old values array if needed
            value.split(",").forEach(v => {
              addToOldValuesIfNeeded(key, v.trim());
            });
          } else {
            // for all other values, add to old values array if needed
            addToOldValuesIfNeeded(key, value);
          }
        }
      });
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      writeOldValuesToCSV(oldValues);
    });
}

function writeOldValuesToCSV(data) {
  const csvWriter = createCsvWriter({
    path: OUTPUT_CSV_PATH,
    header: [{ id: "field", title: "field" }, { id: "value", title: "value" }],
  });

  csvWriter
    .writeRecords(uniqueArray(data))
    .then(() => console.log("The CSV file was written successfully"));
}
