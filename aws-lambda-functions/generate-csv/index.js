// zip -r ../generate-csv.zip *
/*
* in the lambda function for the csv generate. 
* go to configration -> Environment variables
* add the following "Environment variables": 
* 1) DATABASE_URL
* 2) ACCESS_KEY_ID // Note: ACCESS_KEY_ID is the AWS_ACCESS_KEY_ID
* 3) REGION // Note: REGION is the AWS_REGION
* 4) SECRET_ACCESS_KEY // Note: SECRET_ACCESS_KEY is the AWS_SECRET_ACCESS_KEY
*
*/
const promise = require("bluebird");
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
const path = require("path");
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

const AWS_CREATE_CSV_EXPORT = sql("./sql/aws_create_csv_export.sql");
const AWS_SEARCH = sql("./sql/aws_search.sql");
const AWS_SEARCH_CHINESE = sql("./sql/aws_search_chinese.sql");

const AWS_SEARCH_CASES = sql("./sql/aws_search_cases.sql");
const AWS_CASES = sql("./sql/aws_cases.sql");

const AWS_SEARCH_METHODS = sql("./sql/aws_search_methods.sql");
const AWS_METHODS = sql("./sql/aws_methods.sql");

const AWS_SEARCH_ORGANIZATIONS = sql("./sql/aws_search_organizations.sql");
const AWS_ORGANIZATIONS = sql("./sql/aws_organizations.sql");

const AWS_UPDATE_CSV_EXPORT = sql("./sql/aws_update_csv_export.sql");


const {createCSVDataDump} = require("./create-csv-data-dump.js");

const unixTimestampGeneration = () => {
  return Math.floor(Date.now() / 1000)
}

const generateCsvExportId = async (userId) => {
  let unixTimestamp = unixTimestampGeneration();
  let csvExportId = userId.toString() + unixTimestamp.toString();

  return csvExportId;
}

const createCSVEntry = async (params) => {
  let csvExportId = await generateCsvExportId(params.userId);
  let type = params.type;
  if (params.page == 'collection') { type = 'Collection - ' + type ; };
  try {
    let results = await db.one(AWS_CREATE_CSV_EXPORT, {
      csvExportId: csvExportId,
      type: type,
      userId: params.userId,
    });
    return results;
  } catch (err) {
    console.log("createCSVEntry error - ", err);
    throw err;
  }
};

const getSearchDownloadResults = async (params) => {
  try {
    let results = null;
    let queryFile = AWS_SEARCH;
    switch (params.type) {
      case "case":
        queryFile = casesQueryFile(params.filters);
        break;
      case "method":
        queryFile = methodsQueryFile(params.filters);
        break;
      case "organization":
        queryFile = organizationsQueryFile(params.filters);
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

const casesQueryFile = (params) => {
  const str = params.query;
  if (str !== undefined && str !== null && str !== "") {
    return AWS_SEARCH_CASES;
  } else {
    return AWS_CASES;
  }
};

const methodsQueryFile = (params) => {
  const str = params.query;
  if (str !== undefined && str !== null && str !== "") {
    return AWS_SEARCH_METHODS;
  } else {
    return AWS_METHODS;
  }
};

const organizationsQueryFile = (params) => {
  const str = params.query;
  if (str !== undefined && str !== null && str !== "") {
    return AWS_SEARCH_ORGANIZATIONS;
  } else {
    return AWS_ORGANIZATIONS;
  }
};



const updateCSVEntry = async (userId, downloadUrl, csvExportId) => {
  try {
    let results = await db.none(AWS_UPDATE_CSV_EXPORT, {
      csvExportId: csvExportId.csv_export_id,
      userId: userId,
      downloadUrl: downloadUrl,
    });
    return results;
  } catch (err) {
    console.log("updateCSVEntry error - ", err);
  }
};

exports.handler = async (event, context) => {
  try {
    let csv_export_id = await createCSVEntry(event.paramsForCSV);
    const result = await getSearchDownloadResults(event);
    let filename = csv_export_id.csv_export_id + ".csv";
    const uploadData = await createCSVDataDump(event.type, result, event.bucket, filename);
    await updateCSVEntry(event.userId, uploadData, csv_export_id);
    return {uploadData: uploadData, userId: event.userId};
  } catch (error) {
    throw error;
  }
};
