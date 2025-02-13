require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

// Function to ensure necessary indexes
async function ensureIndexes() {
  // await db.none(`CREATE INDEX IF NOT EXISTS bookmarks_userid_idx ON bookmarks (userid)`);
  // await db.none(`CREATE INDEX IF NOT EXISTS bookmarks_thingid_idx ON bookmarks (thingid)`);
  // await db.none(`CREATE INDEX IF NOT EXISTS bookmarks_bookmarktype_idx ON bookmarks (bookmarktype)`);
  // await db.none(`CREATE INDEX IF NOT EXISTS authors_user_id_idx ON authors (user_id)`);
  // await db.none(`CREATE INDEX IF NOT EXISTS things_id_idx ON things (id)`);
  // await db.none(`CREATE INDEX IF NOT EXISTS things_hidden_idx ON things (hidden)`);
}

// Function for user_bookmarks
async function getUserBookmarks(userId, language) {
  const query = `
    SELECT * FROM (
      SELECT
        bookmarks.thingid as id,
        bookmarks.bookmarktype AS type,
        texts.title,
        things.photos,
        things.post_date,
        things.updated_date,
        things.published,
        true as bookmarked
      FROM
        bookmarks,
        things,
        get_localized_texts_fallback(things.id, $/language/, things.original_language) AS texts
      WHERE
        things.hidden = false
        AND bookmarks.userid = $/userId/
        AND bookmarks.thingid = things.id
        AND bookmarks.bookmarktype = things.type
    ) t ORDER BY updated_date;
  `;
  return db.any(query, { userId, language });
}

// Function for authored_things
async function getAuthoredThings(userId, language) {
  const query = `
    SELECT DISTINCT
      authors.user_id author,
      (authors.thingid, texts.title, things.type, things.published, things.photos, things.post_date, things.updated_date, bookmarked(things.type, things.id, $/userId/))::object_short thing,
      authors.thingid,
      things.updated_date
    FROM
      authors,
      things,
      get_localized_texts_fallback(things.id, $/language/, things.original_language) AS texts
    WHERE
      texts.thingid = authors.thingid
      AND texts.thingid = things.id
      AND things.hidden = false
      AND authors.user_id = $/userId/
    ORDER BY authors.thingid, things.updated_date;
  `;
  return db.any(query, { userId, language });
}

// Function for authored_cases
async function getAuthoredCases(userId, language) {
  const authoredThings = await getAuthoredThings(userId, language);
  const query = `
    SELECT
      array_agg(thing) cases,
      author
    FROM ($/authoredThings:csv/)
    WHERE (thing).type = 'case'
    GROUP BY author;
  `;
  return db.any(query, { authoredThings });
}

// Function for authored_methods
async function getAuthoredMethods(userId, language) {
  const authoredThings = await getAuthoredThings(userId, language);
  const query = `
    SELECT
      array_agg(thing) methods,
      author
    FROM ($/authoredThings:csv/)
    WHERE (thing).type = 'method'
    GROUP BY author;
  `;
  return db.any(query, { authoredThings });
}

// Function for authored_organizations
async function getAuthoredOrganizations(userId, language) {
  const authoredThings = await getAuthoredThings(userId, language);
  const query = `
    SELECT
      array_agg(thing) organizations,
      author
    FROM ($/authoredThings:csv/)
    WHERE (thing).type = 'organization'
    GROUP BY author;
  `;
  return db.any(query, { authoredThings });
}

// Function for row_to_json
async function getRowToJson(userId, language) {
  const userBookmarks = await getUserBookmarks(userId, language);
  console.log("@@@@@@@@111111 userBookmarks ", userBookmarks)
  // const authoredCases = await getAuthoredCases(userId, language);
  // console.log("@@@@@@@@222222222 authoredCases ", authoredCases)

  // const authoredMethods = await getAuthoredMethods(userId, language);
  // console.log("@@@@@@@@222222222 authoredMethods ", authoredMethods);

  // const authoredOrganizations = await getAuthoredOrganizations(userId, language);

  // const query = `
  //   SELECT row_to_json(user_row) as user
  //   FROM (
  //     SELECT
  //       users.*,
  //       'user' as type,
  //       COALESCE($/authoredCases/, '{}') cases,
  //       COALESCE($/authoredMethods/, '{}') methods,
  //       COALESCE($/authoredOrganizations/, '{}') organizations,
  //       COALESCE(
  //         ARRAY(
  //           SELECT ROW(id, title, type, published, photos, post_date, updated_date, bookmarked)::object_short
  //           FROM ($/userBookmarks:csv/)
  //         ),
  //         '{}'
  //       ) bookmarks
  //     FROM
  //       users
  //     WHERE
  //       users.id = $/userId/
  //   ) user_row;
  // `;
  // return db.one(query, { userId, authoredCases, authoredMethods, authoredOrganizations, userBookmarks });
}

// Main function
async function main() {
  const userId = 418161;
  const language = 'en';

  try {
    // Ensure indexes exist
    await ensureIndexes();

    // Get user data
    const userData = await getRowToJson(userId, language);
    console.log("User Data:", userData);
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
