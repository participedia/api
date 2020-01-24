// csv source: https://docs.google.com/spreadsheets/d/1uiSNHVzTWByC9ZgawKLcE7WTVyiKELQFxn_lthQDgFI/edit#gid=0
// to run: node scripts/seed-db-with-completeness-status.js [table]
// ie: node scripts/seed-db-with-completeness-status.js "cases"

const fs = require("fs");
const parse = require("csv-parse");
const { db } = require("../api/helpers/db.js");

const args = process.argv.slice(2);
const table = args[0];
const filepaths = {
  cases: "./csv/completeness-status-for-cases.csv",
  methods: "./csv/completeness-status-for-methods.csv",
  organizations: "./csv/completeness-status-for-organizations.csv",
};

readCSV(filepaths[table]);

async function updateCase(id, completeness) {
  try {
    await db.one(`SELECT 1 FROM ${table} WHERE id = ${id}`);

    // if we have an entry for this id, then save completeness to db
    try {
      // save to db
      await db.none(
        `UPDATE ${table} SET completeness = '${completeness}' WHERE id = ${id}`
      );
      console.log(`Entry id: ${id}, updated with ${completeness}`);
    } catch (err) {
      console.log("UPDATE error - ", err);
    }
  } catch (err) {
    console.log(`${table}/${id}/ - NOT FOUND`);
  }
}

async function handleRow(row) {
  const completenessStatusByNumber = {
    1: "stub",
    2: "partial_content",
    3: "partial_citations",
    4: "partial_editing",
    5: "complete",
  };
  const id = row[0];
  const completenessNumber = row[2];
  const status = completenessStatusByNumber[completenessNumber];
  if (id && status) {
    await updateCase(id, status);
  }
}

function readCSV(filepath) {
  fs.createReadStream(filepath)
    .pipe(parse({ delimiter: "," }))
    .on("data", row => {
      handleRow(row);
    });
}
