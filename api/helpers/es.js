var process = require('process')
var elasticsearch = require('elasticsearch')
require('dotenv').config({silent: process.NODE_ENV == 'production'})

var client = new elasticsearch.Client({
  host : 'search-ppsandbox-6atza6pvphfjp73xqg7yhyl5qi.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY
  }
  // log: 'trace'
})

module.exports = exports = client
