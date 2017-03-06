const promise = require("bluebird");

const options = {
  // Initialization Options
  promiseLib: promise
};
const pgp = require("pg-promise")(options);

const connectionString = process.env.DATABASE_URL;

const parse = require("pg-connection-string").parse;

let config;

try {
  config = parse(connectionString);
  if (process.env.NODE_ENV !== "test") {
    config.ssl = true;
  }
} catch (e) {
  console.log("# Error parsing DATABASE_URL environment variable");
}
const db = pgp(config);

module.exports = (exports = db);
