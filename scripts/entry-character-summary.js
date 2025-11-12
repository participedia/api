require("dotenv").config({ silent: process.env.NODE_ENV === "production" });

const { db } = require("../api/helpers/db.js");
const { SUPPORTED_LANGUAGES } = require("../constants.js");

const OCTOBER_RANGE = {
  label: "October 2025",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
};

const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(locale =>
  (locale.twoLetterCode || "").toLowerCase()
).filter(Boolean);

if (!supportedLanguageCodes.length) {
  throw new Error("SUPPORTED_LANGUAGES contains no valid twoLetterCode values.");
}

const EMBEDDED_IMAGE_PATTERN = /<img src="data:image\/[a-z]+;base64[^>]*>/i;
const EMBEDDED_IMAGE_REGEX = new RegExp(
  EMBEDDED_IMAGE_PATTERN.source,
  "gi"
);

const sanitizeRichText = value =>
  (value || "").replace(EMBEDDED_IMAGE_REGEX, "");

const countTranslatedCharacters = entry => {
  const title = entry.title || "";
  const description = entry.description || "";
  const body = sanitizeRichText(entry.body || "");
  return title.length + description.length + body.length;
};

const formatDate = value => {
  if (!value) {
    return "n/a";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "n/a";
  }

  return date.toISOString().split("T")[0];
};

async function fetchOctoberEntriesWithTranslations() {
  const query = `
    WITH october_things AS (
      SELECT
        id AS thing_id,
        original_language,
        post_date::date AS post_date
      FROM things
      WHERE hidden = false
        AND published = true
        AND post_date::date BETWEEN $(startDate) AND $(endDate)
    ),
    localized_versions AS (
      SELECT
        lt.thingid,
        lower(lt.language) AS language,
        lt.title,
        lt.description,
        lt.body,
        lt.timestamp,
        ROW_NUMBER() OVER (
          PARTITION BY lt.thingid, lower(lt.language)
          ORDER BY lt.timestamp ASC
        ) AS language_version_rank
      FROM localized_texts lt
      JOIN october_things ot
        ON ot.thing_id = lt.thingid
      WHERE (ot.original_language IS NULL
             OR lower(lt.language) <> lower(ot.original_language))
        AND lower(lt.language) IN ($(supportedLanguages:csv))
        AND COALESCE(lt.body, '') <> ''
    )
    SELECT
      ot.thing_id,
      ot.post_date,
      ot.original_language,
      lv.language,
      lv.title,
      lv.description,
      lv.body,
      lv.timestamp AS first_translation_timestamp
    FROM october_things ot
    JOIN localized_versions lv
      ON lv.thingid = ot.thing_id
    WHERE lv.language_version_rank = 1
    ORDER BY ot.post_date ASC, lv.language ASC;
  `;

  return db.any(query, {
    startDate: OCTOBER_RANGE.startDate,
    endDate: OCTOBER_RANGE.endDate,
    supportedLanguages: supportedLanguageCodes,
  });
}

async function reportOctoberTranslationCharacters() {
  try {
    const rows = await fetchOctoberEntriesWithTranslations();

    if (!rows.length) {
      console.log(`No translated localized_text entries found for ${OCTOBER_RANGE.label}.`);
      process.exit(0);
    }

    const distinctThingIds = new Set();
    const perLanguage = new Map();
    const perThing = new Map();
    let totalCharacters = 0;

    rows.forEach(row => {
      distinctThingIds.add(row.thing_id);
      const charCount = countTranslatedCharacters(row);
      totalCharacters += charCount;

      const languageSummary =
        perLanguage.get(row.language) || { translations: 0, characters: 0 };
      languageSummary.translations += 1;
      languageSummary.characters += charCount;
      perLanguage.set(row.language, languageSummary);

      const thingSummary =
        perThing.get(row.thing_id) || {
          translations: 0,
          characters: 0,
          languages: [],
        };
      thingSummary.translations += 1;
      thingSummary.characters += charCount;
      thingSummary.languages.push(row.language);
      perThing.set(row.thing_id, thingSummary);

      console.log(
        [
          `Thing ${row.thing_id}`,
          `(original ${row.original_language || "n/a"})`,
          `first ${row.language} version => ${charCount} characters`,
          `(post ${formatDate(row.post_date)}, translation ${formatDate(
            row.first_translation_timestamp
          )})`,
        ].join(" ")
      );
    });

    console.log("");
    console.log(`Entries published in ${OCTOBER_RANGE.label}: ${distinctThingIds.size}`);
    console.log(`Translated versions counted: ${rows.length}`);
    console.log(`Total translated characters: ${totalCharacters}`);

    if (perLanguage.size) {
      console.log("\nCharacters by language:");
      [...perLanguage.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([language, summary]) => {
          console.log(
            `- ${language}: ${summary.translations} translations, ${summary.characters} characters`
          );
        });
    }

    if (perThing.size) {
      console.log("\nCharacters by entry:");
      [...perThing.entries()]
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([thingId, summary]) => {
          const languages = summary.languages.join(", ");
          console.log(
            `- thing ${thingId}: ${summary.translations} translations (${languages}), ${summary.characters} characters`
          );
        });
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to calculate October translation characters", error);
    process.exit(1);
  }
}

reportOctoberTranslationCharacters();
