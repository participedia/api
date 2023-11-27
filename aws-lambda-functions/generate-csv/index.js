const AWS = require("aws-sdk");
const promise = require("bluebird");
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
const path = require("path");
// const request = require('request').defaults({ encoding: null });
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
// aws lambda update-function-code --function-name lambdaFunc \
// --zip-file fileb:///home/ramzi/Desktop/apps/nodejs/api/aws-lambda-functions/lambdaFunc.zip
const pgp = require("pg-promise")(options);

let config;
try {
  config = parse(connectionString);
  config.ssl = {
    sslmode: "require",
    rejectUnauthorized: false,
  };
} catch (e) {
  console.error("# Error parsing DATABASE_URL environment variable");
}
let db = pgp(config);

function sql(filename) {
  return new pgp.QueryFile(path.join(__dirname, filename), {
    minify: true,
  });
}

const AWS_SEARCH = sql("./sql/aws_search.sql");
const AWS_SEARCH_CHINESE = sql("./sql/aws_search_chinese.sql");
const AWS_SEARCH_CASES = sql("./sql/aws_search_cases.sql");
const AWS_SEARCH_METHODS = sql("./sql/aws_search_methods.sql");
const AWS_SEARCH_ORGANIZATIONS = sql("./sql/aws_search_organizations.sql");

const getSearchDownloadResults = async (params) => {
  try {
    let results = null;
    let queryFile = AWS_SEARCH;
    switch (params.type) {
      case "case":
        queryFile = AWS_SEARCH_CASES;
        break;
      case "method":
        queryFile = AWS_SEARCH_METHODS;
        break;
      case "organization":
        queryFile = AWS_SEARCH_ORGANIZATIONS;
        break;
    }
    
    if (params.lang === "zh" && params.query) {
      results = await db.any(AWS_SEARCH_CHINESE, params.filters);
    } else {
      results = await db.any(queryFile, params.filters);
    }
    return results;
  } catch (err) {
    console.log("getSearchDownloadResults error - ", err);
    throw err;
  }
}

exports.handler = async (event, context) => {
  // var key = event.Records[0].s3.object.key;
  // var bucket = event.Records[0].s3.bucket.name;
  // var rawUrl = `https://s3.amazonaws.com/${bucket}/${key}`;
  // const evn = JSON.stringify(event);
  // const con = JSON.stringify(context)
  try {
    const result = await getSearchDownloadResults(event);
    if(Array.isArray(result) && result.length){
      console.log('!!!!!!!!!!!!!!!!11111 result[0]',  result[0]);
    }
  } catch (error) {
    throw error;
  }
  
  console.log('!!!!!!!!!!!!!!!! handler event', JSON.stringify(event))
  console.log('!!!!!!!!!!!!!!!! handler context', JSON.stringify(context))
  // callback(JSON.stringify({eve: evn, con: con}));
};
