var options = {
  // Initialization Options
  promiseLib: promise
};
var promise = require('bluebird');
var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var parse = require('pg-connection-string').parse;
var log = require('winston')
var config;

try {
  config = parse(connectionString)
  
  if (process.env.NODE_ENV !== "test") {
    config['ssl'] = true
  }
} catch (e) {
  console.log("# Error parsing DATABASE_URL environment variable")
}
var db = pgp(config);

module.exports = exports = db
