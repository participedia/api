// Run this to delete blocked users from DB based on blocked status from Auth0
// It will also delete any corresponding records in the authors
// and bookmarks tables for the blocked user

// TO RUN:
// node ./scripts/delete-blocked-users-from-DB.js ./auth0-users.csv
//
// CSV input file should have the following columns: Id, Email, Blocked
//
// export users CSV file via auth0 extension UI
// https://participedia.us8.webtask.io/auth0-user-import-export/export

const csv = require("csv-parser");
const fs = require("fs");

const { db, USER_BY_EMAIL } = require("../api/helpers/db");

async function start() {
  const csvFile = process.argv[2];
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on("data", user => {
      deleteUserIfBlocked(user);
    });
}

async function deleteUserIfBlocked(auth0User) {
  // return early if user is not blocked
  if (auth0User.Blocked !== "true") return;

  const userByEmail = await db.oneOrNone(USER_BY_EMAIL, {
    userEmail: auth0User.Email,
  });

  if (userByEmail && userByEmail.id) {
    // delete author records for blocked user
    await db.any(`DELETE FROM authors WHERE user_id = ${userByEmail.id}`);
    console.log(`deleted authors records for user id: `, userByEmail.id);

    // delete bookmark records for blocked user
    await db.any(`DELETE FROM bookmarks WHERE userid = ${userByEmail.id}`);
    console.log(`deleted bookmark records for user id: `, userByEmail.id);

    // delete blocked user
    await db.oneOrNone(`DELETE FROM users WHERE id = ${userByEmail.id}`);
    console.log(`deleted user id: `, userByEmail.id);
  }
}

start();
