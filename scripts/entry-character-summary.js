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
      WITH first_complete_entry_text AS (
        SELECT
          t.id AS thingid,
          lt.language,
          lt.title,
          lt.description,
          lt.body,
          lt.timestamp AS entry_timestamp,
          lt.timestamp::date AS entry_date,
          t.original_language,
          vc.localized_version_count
        FROM things t
        JOIN LATERAL (
          SELECT lt_inner.*
          FROM localized_texts lt_inner
          WHERE lt_inner.thingid = t.id
            AND lt_inner.title IS NOT NULL
            AND lt_inner.description IS NOT NULL
            AND lt_inner.body IS NOT NULL
          ORDER BY
            CASE
              WHEN NULLIF(t.original_language, '') IS NOT NULL
                   AND lt_inner.language = t.original_language THEN 0
              ELSE 1
            END,
            lt_inner.timestamp ASC
          LIMIT 1
        ) lt ON TRUE
        JOIN LATERAL (
          SELECT COUNT(*) AS localized_version_count
          FROM localized_texts lt_count
          WHERE lt_count.thingid = t.id
            AND lt_count.language = lt.language
        ) vc ON TRUE
        WHERE t.hidden = false
          AND t.published = true
      )
      SELECT
        thingid,
        language,
        title,
        description,
        body,
        original_language,
        entry_date,
        localized_version_count
      FROM first_complete_entry_text
      WHERE entry_timestamp::date BETWEEN $(startDate) AND $(endDate)
      ORDER BY entry_timestamp ASC
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

    const totalSummary = { entries: 0, characters: 0 };
    const summariesByLanguage = new Map();
    const entriesWithEmbeddedImages = [];

    for (const row of rows) {
      totalSummary.entries += 1;

      const characters = countCharactersForEntry(row);
      totalSummary.characters += characters;

      const languageKey = row.language || "unknown";
      const languageSummary =
        summariesByLanguage.get(languageKey) || {
          entries: 0,
          characters: 0,
        };

      languageSummary.entries += 1;
      languageSummary.characters += characters;
      summariesByLanguage.set(languageKey, languageSummary);

      console.log(
        `Thing ${row.thingid} counted once (language ${row.language}, original ${row.original_language}) with ${row.localized_version_count} localized_texts versions; using earliest complete version only.`
      );

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
      `${totalSummary.entries} entries, ${totalSummary.characters} characters (Oct 1-31)`
    );

    if (summariesByLanguage.size) {
      console.log("Breakdown by language (first version per thing/language):");
      [...summariesByLanguage.entries()]
        .sort(([aLang], [bLang]) => aLang.localeCompare(bLang))
        .forEach(([language, summary]) => {
          console.log(
            `- ${language}: ${summary.entries} entries, ${summary.characters} characters`
          );
        });
    }

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
