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

  // ****** start only testing ********8 
  // let list = [];
  // if(users.length){
  //   list.push(users[0]);
  // }
  // ****** end only testing ********8

  //START BLOCK USERS
  for (const user of users) {
    await timeout(2000);
    try {
      const user_id = user.id.toString();
      console.log(`---------- START deleting user with ID ${user_id} ----------`)
      await deleteUserAuth0(user_id);
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

const deleteUserAuth0 = async (user_id) => {
  try {
    return auth0Client.deleteUser(
      { id: `${user_id}` },
      (err, auth0User) => {
        if (err) {
        console.log(`?????????? ERROR auth0 deleting user ID ${user_id} ??????????`, err?.message)
          return false;
        } else {
          return auth0User;
        }
      }
    );
  } catch (error) {
    return false;
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


blockUsers();

