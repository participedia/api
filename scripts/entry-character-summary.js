require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

const TARGET_DATES = [
  { key: "2025-10-30", label: "Oct 30, 2025" },
  { key: "2025-10-31", label: "Oct 31, 2025" },
];

const sanitizeRichText = value =>
  (value || "").replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g, "");

const countCharactersForEntry = entry =>
  sanitizeRichText(entry.title).length +
  sanitizeRichText(entry.description).length +
  sanitizeRichText(entry.body).length;

const normalizeDate = value => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.toString().slice(0, 10);
};

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
        AND localized_texts.timestamp::date IN ($(dates:csv))
      ORDER BY localized_texts.timestamp ASC
      `,
      { dates: TARGET_DATES.map(day => day.key) }
    );

    if (!rows.length) {
      console.log("No localized text entries found for Oct 30 or Oct 31.");
      process.exit(0);
    }

    const summary = TARGET_DATES.reduce(
      (acc, day) => ({
        ...acc,
        [day.key]: { entries: 0, characters: 0 },
      }),
      { total: { entries: 0, characters: 0 } }
    );

    for (const row of rows) {
      const dayKey = normalizeDate(row.entry_date);
      if (!summary[dayKey]) {
        continue;
      }

      summary[dayKey].entries += 1;
      summary.total.entries += 1;

      const characters = countCharactersForEntry(row);
      summary[dayKey].characters += characters;
      summary.total.characters += characters;
    }

    console.log("Entries and characters added on Oct 30 and Oct 31:");
    TARGET_DATES.forEach(day => {
      const daySummary = summary[day.key];
      console.log(
        `${day.label}: ${daySummary.entries} entries, ${daySummary.characters} characters`
      );
    });
    console.log(
      `Total (Oct 30-31): ${summary.total.entries} entries, ${summary.total.characters} characters`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to calculate October character totals", error);
    process.exit(1);
  }
}

reportOctoberCharacterTotals();
