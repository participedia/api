require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp } = require("../api/helpers/db.js");
const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "delete:users",
});

async function blockUsers() {
  console.log('*********** START PROCESSING ***********');

  // START DB QUERY
  const users = await db.any(
    `
    SELECT id, bio FROM users WHERE id NOT IN (
      SELECT user_id FROM authors WHERE users.id = authors.user_id
    )
    AND users.bio LIKE '%http%'
    `
  )
  // END DB QUERY

  console.log(`find ${users.length} users`);

  let list = [];
  if(users.length){
    list.push(users[0]);
  }
  //START BLOCK USERS
  for (const user of list) {
    try {
      console.log(`---------- START deleting user with ID ${user.id.toString()} ----------`)
      await auth0Client.deleteUser({id: user.id.toString()});
      await db.any(`DELETE FROM users WHERE id = ${user.id}`);
      console.log(`^^^^^^^^^^ DONE deleting user ID ${user.id} ^^^^^^^^^^`)
    } catch (error) {
      console.log(`?????????? ERROR deleting user ID ${user.id} ??????????`, error?.message)
    }
  }
  //END BLOCK USERS
  console.log('*********** FINISHED PROCESSING ***********');
  process.exit();
}

blockUsers();

