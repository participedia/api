let process = require("process");
let elasticsearch = require("elasticsearch");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let AWS = require("aws-sdk");

let client = new elasticsearch.Client({
  host: "search-pp-stage-37xn6cdq7tj7ehv5rjrgxgrjhq.us-east-1.es.amazonaws.com",
  connectionClass: require("http-aws-es"),
  amazonES: {
    region: "us-east-1",
    credentials: AWS.config.credentials
  }
  // log: 'debug'
});

module.exports = (exports = client);
