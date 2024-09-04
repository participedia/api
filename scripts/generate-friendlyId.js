require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

async function generateFriendlyId() {
  console.log('*********** START PROCESSING ***********');

  try {
    // AND localized_texts.timestamp > '2023-07-01'


    const entries = await db.any(
      `
      SELECT localized_texts.thingid, localized_texts.title, localized_texts.language, things.id, things.original_language, things.type, localized_texts.timestamp
      FROM (SELECT * FROM things WHERE things.original_language = 'en' GROUP BY id) as things
      JOIN localized_texts ON things.id = localized_texts.thingid
      WHERE things.hidden = false AND things.published = true AND (
        localized_texts.title IS NOT NULL OR localized_texts.title != '' AND localized_texts.language = 'en'
      )
      ORDER BY localized_texts.timestamp DESC
      `
    );

    console.log('*********** START PROCESSING *********** length ', entries.length);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      console.log('**************************************************************************************');
      console.log('*************************************************************************************');
      await saveFriendlyId(entry);
    }
    console.log('&&&&&& FriendlyIds generated successfully! &&&&&&&');

    process.exit();
  } catch (error) {
    console.log('????????????????? catch error ?????????????? error', error)
    process.exit();
  }

}

async function saveFriendlyId(entry) {
  try {
    const title = generateSlug(entry.title);
    const tableName = `${entry.type}s`;
    const entryId = entry.id;
    console.log('*******************************title title*******************************************************', title);
    console.log('*******************************id entryId*******************************************************', entryId);
    if(title && entryId){

      const existingEntry = await db.oneOrNone(
        `SELECT friendly_id FROM ${tableName} WHERE friendly_id = $1 AND id != $2`,
        [title, entryId]
      );

      let newFriendlyId = title;

      // Step 2: If it exists, modify the title to make it unique
      if (existingEntry) {
        newFriendlyId = `${title}-1`;
        console.log('####################################### newFriendlyId ######################', newFriendlyId);

        // Ensure uniqueness by checking if the newFriendlyId already exists
        let suffix = 1;
        while (
          await db.oneOrNone(
            `SELECT friendly_id FROM ${tableName} WHERE friendly_id = $1 AND id != $2`,
            [newFriendlyId, entryId]
          )
        ) {
          suffix += 1;
          newFriendlyId = `${title}-${suffix}`;
          console.log('Ensure uniqueness &&&&&&&&&&&&&&&&&&&&&&&&&&&&&& newFriendlyId &&&&&&&&&&&&&&&&&&&&&', newFriendlyId);

        }
      }

      // Step 3: Update the friendly_id column where the id matches
      await db.any(`UPDATE ${tableName} SET friendly_id = $1 WHERE id = $2 RETURNING *`, 
        [newFriendlyId, entryId])
    }
  } catch (error) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! error !!!!!!!!!!!!!!! error ", error);
  }
}

function generateSlug(title) {
  return title
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim() // Remove whitespace from both ends
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
}


generateFriendlyId();
