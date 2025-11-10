require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

const OCTOBER_RANGE = {
  label: "October 2025",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
};

const sanitizeRichText = value =>
  (value || "").replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g, "");

const countCharactersForEntry = entry =>
  sanitizeRichText(entry.title).length +
  sanitizeRichText(entry.description).length +
  sanitizeRichText(entry.body).length;

async function reportOctoberCharacterTotals() {
  try {
    const rows = await db.any(
      `
      SELECT
        localized_texts.thingid,
        localized_texts.language,
        localized_texts.title,
        localized_texts.description,
        localized_texts.body,
        localized_texts.timestamp::date AS entry_date
      FROM localized_texts
      JOIN things ON things.id = localized_texts.thingid
      WHERE things.hidden = false
        AND things.published = true
        AND localized_texts.timestamp::date BETWEEN $(startDate) AND $(endDate)
      ORDER BY localized_texts.timestamp ASC
      `,
      {
        startDate: OCTOBER_RANGE.startDate,
        endDate: OCTOBER_RANGE.endDate,
      }
    );

    if (!rows.length) {
      console.log("No localized text entries found for October 2025.");
      process.exit(0);
    }

    const summary = { entries: 0, characters: 0 };

    for (const row of rows) {
      summary.entries += 1;

      const characters = countCharactersForEntry(row);
      summary.characters += characters;
    }

    console.log(`Entries and characters added in ${OCTOBER_RANGE.label}:`);
    console.log(
      `${summary.entries} entries, ${summary.characters} characters (Oct 1-31)`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to calculate October character totals", error);
    process.exit(1);
  }
}

reportOctoberCharacterTotals();
