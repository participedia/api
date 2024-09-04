require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

async function emptyFriendlyId() {
  console.log('*********** START PROCESSING ***********');

  try {
    await db.none(`UPDATE cases SET friendly_id = NULL;`);
    await db.none(`UPDATE organizations SET friendly_id = NULL;`);
    await db.none(`UPDATE methods SET friendly_id = NULL;`);

    console.log('&&&&&& Empty friendlyIds have been done successfully! &&&&&&&');

    process.exit();
  } catch (error) {
    console.log('????????????????? catch error ?????????????? error', error)
    process.exit();
  }

}


emptyFriendlyId();
