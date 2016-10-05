var process = require('process')
var elasticsearch = require('elasticsearch')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

var client = new elasticsearch.Client({
  // host: 'search-ppsandbox-6atza6pvphfjp73xqg7yhyl5qi.us-east-1.es.amazonaws.com',
  host: 'search-pp-stage-37xn6cdq7tj7ehv5rjrgxgrjhq.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  // log: 'debug'
})


// var client = new elasticsearch.Client({
//   hosts: 'localhost:32769',
// })
    // hosts: esDomain.endpoint + ':' + String(esDomain.port),

module.exports = exports = client
