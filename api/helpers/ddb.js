var process = require('process')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

var ddb = require('dynamodb').ddb({ 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = exports = ddb
