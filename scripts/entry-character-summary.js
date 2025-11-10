require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

const OCTOBER_RANGE = {
  label: "October 2025",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
};

const EMBEDDED_IMAGE_PATTERN = /<img src="data:image\/[a-z]+;base64[^>]*>/i;
const EMBEDDED_IMAGE_REGEX = new RegExp(
  EMBEDDED_IMAGE_PATTERN.source,
  "gi"
);

const sanitizeRichText = value =>
  (value || "").replace(EMBEDDED_IMAGE_REGEX, "");

const hasEmbeddedImage = value =>
  EMBEDDED_IMAGE_PATTERN.test(value || "");

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
    const entriesWithEmbeddedImages = [];

    for (const row of rows) {
      summary.entries += 1;

      const characters = countCharactersForEntry(row);
      summary.characters += characters;

      if (
        hasEmbeddedImage(row.title) ||
        hasEmbeddedImage(row.description) ||
        hasEmbeddedImage(row.body)
      ) {
        entriesWithEmbeddedImages.push({
          thingId: row.thingid,
          language: row.language,
          entryDate: row.entry_date,
        });
      }
    }

    console.log(`Entries and characters added in ${OCTOBER_RANGE.label}:`);
    console.log(
      `${summary.entries} entries, ${summary.characters} characters (Oct 1-31)`
    );

    if (entriesWithEmbeddedImages.length) {
      console.log(
        `${entriesWithEmbeddedImages.length} entries contain embedded base64 images:`
      );
      entriesWithEmbeddedImages.forEach(entry => {
        console.log(
          `- thing ${entry.thingId} (${entry.language}) on ${entry.entryDate}`
        );
      });
    } else {
      console.log("No embedded base64 images detected in October entries.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to calculate October character totals", error);
    process.exit(1);
  }
}

reportOctoberCharacterTotals();
