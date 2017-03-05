let options = {
  // Initialization Options
  promiseLib: promise
};
let promise = require("bluebird");
let pgp = require("pg-promise")(options);
let connectionString = process.env.DATABASE_URL;
let parse = require("pg-connection-string").parse;
let config;

try {
  config = parse(connectionString);
  if (process.env.NODE_ENV !== "test") {
    config["ssl"] = true;
  }
} catch (e) {
  console.log("# Error parsing DATABASE_URL environment variable");
}
let db = pgp(config);

module.exports = (exports = db);
