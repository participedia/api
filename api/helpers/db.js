var promise = require("bluebird");
var options = {
    // Initialization Options
    promiseLib: promise,
    query: evt => console.info("Executing query %s", evt.query)
};
var pgp = require("pg-promise")(options);
const path = require("path");
var connectionString = process.env.DATABASE_URL;
var parse = require("pg-connection-string").parse;
var log = require("winston");
var config;

try {
    config = parse(connectionString);
    if (process.env.NODE_ENV === "test" || config.host === "localhost") {
        config.ssl = false;
    } else {
        config.ssl = true;
    }
} catch (e) {
    console.log("# Error parsing DATABASE_URL environment variable");
}
var db = pgp(config);

function sql(filename) {
    return new pgp.QueryFile(path.join(__dirname, filename), { minify: true });
}

module.exports = {
    db: db,
    sql: sql
};
