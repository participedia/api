var options = {
  // Initialization Options
  promiseLib: promise
};
var promise = require('bluebird');
var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var parse = require('pg-connection-string').parse;
var config = parse(connectionString)
config['ssl'] = true
var db = pgp(config);

module.exports = exports = db
