// const AWS = require("aws-sdk");
// const s3 = new AWS.S3();
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
const AWS_UPDATE_CSV_EXPORT = sql("./sql/aws_update_csv_export.sql");

const {createCSVDataDump} = require("./create-csv-data-dump.js");

const getSearchDownloadResults = async (params) => {
  console.log('!!!!!!!!!!!!!!!! getSearchDownloadResults params',  params);

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
    
    if (params.lang === "zh" && params.user_query) {
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

const updateCSVEntry = async (userId, downloadUrl, csvExportId) => {
  try {
    let results = await db.none(AWS_UPDATE_CSV_EXPORT, {
      csvExportId: csvExportId.csv_export_id,
      userId: userId,
      downloadUrl: downloadUrl,
    });
    return results;
  } catch (err) {
    console.log("updatecreateCSVEntry error - ", err);
    throw err;
  }
};

exports.handler = async (event, context) => {
  try {
    const result = await getSearchDownloadResults(event);
    const csv_export_id = event.csv_export_id
    let filename = csv_export_id+".csv";
    const uploadData = await createCSVDataDump(event.type, result, event.bucket, filename);
    console.log('!!!!!!!!! uploadData uploadedLocation', uploadedLocation);
    console.log('!!!!!!!!! event.userId event.userId', event.userId);
    console.log('!!!!!!!!!csv_export_id csv_export_id', csv_export_id);
    await updateCSVEntry(event.userId, uploadData, csv_export_id);
    return uploadData;

  } catch (error) {
    console.log('handler error', error)
    throw error;
  }
  // callback(JSON.stringify({eve: evn, con: con}));
};
