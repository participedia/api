const { db, INSERT_LOCALIZED_TEXT } = require("../api/helpers/db.js");

// for all records in localized_texts
// for each record where language is not english,
// check to see if there is another record with the same thingid where language is english
// if no then:
  // create a duplicate record and set language to "en"

async function getAllLocalizedTexts() {
  const sql = `SELECT * FROM localized_texts;`;
  return await db
    .any(sql)
    .then(result => result)
    .catch(err => console.log("getAllLocalizedTexts err", err));
}

async function run() {
  const localizedTextRecords = await getAllLocalizedTexts();
  const allEnglishRecords = localizedTextRecords.filter(
    r => r.language === "en"
  );
  const allNonEnglishRecords = localizedTextRecords.filter(
    r => r.language !== "en"
  );

  await Promise.all(
    allNonEnglishRecords.map(async nonEnglishRecord => {
      const englishRecord = allEnglishRecords.find(
        r => r.thingid === nonEnglishRecord.thingid
      );
      // if there is no english record, create one
      if (!englishRecord) {
        const newRecord = Object.assign({}, nonEnglishRecord);
        delete newRecord.timestamp;
        delete newRecord.thingid;
        newRecord.id = nonEnglishRecord.thingid;
        newRecord.language = "en";
        db.none(INSERT_LOCALIZED_TEXT, newRecord);
      }
    })
  );
}

run();
