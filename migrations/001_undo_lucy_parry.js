// Why is this migration named like this?
// We had a bug where if a user edited their information, it would change ALL the users
// and Lucy edited hers, so now EVERY USER was named Lucy Parry. On production.
//
// The underlying issue is resolved, but leaving this here as a cautionary tale
// and an example of a script to write to the database. To run it on, say, production,
// use:
// DATABASE_URL=${DATABASE_PROD_URL} node migrations/undo_lucy_parry.js
// (after sourcing .env so DATABASE_PROD_URL is set)
//

let { db, sql, as } = require("../api/helpers/db");
let fs = require("fs");
const UPDATE_USER = sql("../sql/update_user.sql");

function rename_all_users() {
  let users = JSON.parse(fs.readFileSync("migrations/users.json", "utf8"));
  users.forEach(async function(user) {
    await db.none(UPDATE_USER, {
      id: user.id,
      name: user.name,
      language: "en",
      picture_url: user.picture_url,
      bio: user.bio || ""
    });
  });
}

rename_all_users();
