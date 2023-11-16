require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp } = require("../api/helpers/db.js");
const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

async function blockUsers() {
  console.log('*********** START PROCESSING ***********');

  // START DB QUERY
  const users = await db.any(
    `
    WITH all_hidden_things  AS (
      select id from things
      where hidden = true and "type" != 'collection' 
    ),
    all_authors as (
        SELECT DISTINCT ON (thingid) thingid, user_id
        FROM authors 
    ),
    all_users as (
    select id, accepted_date, bio from users where accepted_date is null
    )
    SELECT DISTINCT ON (all_users.id) all_users.id
    FROM all_hidden_things, all_authors, all_users
    where all_hidden_things.id = all_authors.thingid 
    and all_authors.user_id = all_users.id 
    and all_users.bio LIKE '%http%'
    `
  )
  // END DB QUERY

  console.log(`find ${users.length} users`);

  //START BLOCK USERS
  for (const user of users) {
    try {
      console.log(`---------- START blocking user with ID ${user.id} ----------`)
      await auth0Client.updateUser({ id: user.id }, { blocked: true });
      console.log(`^^^^^^^^^^ DONE blocking user ID ${user.id} ^^^^^^^^^^`)
    } catch (error) {
      console.log(`?????????? ERROR blocking user ID ${user.id} ??????????`, error?.message)
    }
  }
  //END BLOCK USERS

  console.log('*********** FINISHED PROCESSING ***********');
  process.exit();
}

blockUsers();

