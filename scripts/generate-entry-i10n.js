const promise = require("bluebird");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const pgp = require("pg-promise")(options);
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
var db;
checkConnection();

function checkConnection() {
  let config;
  try {
    config = parse(connectionString);
    if (process.env.NODE_ENV === "test" || config.host === "localhost") {
      config.ssl = false;
    } else {
      config.ssl = true;
    }
    console.log(config);
    console.log()
  } catch (e) {
    console.error("# Error parsing DATABASE_URL environment variable");
  }

  db = pgp(config);
}