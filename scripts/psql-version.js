require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db } = require("../api/helpers/db.js");

async function checkVersion() {
  console.log("*********** START PROCESSING ***********");

  try {
    const res = await db.one(`SELECT version();`);
    console.log("Query Result:", res); // Log the full response
    console.log("PostgreSQL Version:", res.version); // Access the version

    process.exit();
  } catch (error) {
    console.log("????????????????? catch error ?????????????? error", error);
    process.exit();
  }
}

checkVersion();
