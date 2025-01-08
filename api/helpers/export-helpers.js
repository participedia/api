"use strict";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
let {
  db,
  CREATE_CSV_EXPORT,
  UPDATE_CSV_EXPORT,
  REMOVE_CSV_EXPORT,
  CSV_EXPORT
} = require("../helpers/db");
const {createCSVDataDump} = require("./create-csv-data-dump.js");
const {uploadCSVToAWS} = require("./upload-to-aws");
let {
  getSearchResults,
  getSearchDownloadResults,
  getCollectionResults,
  getParamsSearchDownloadResults
} = require("./search");

// const lambda = new AWS.Lambda({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
    let results = await db.one(CREATE_CSV_EXPORT, {
      csvExportId: csvExportId,
      type: type,
      userId: params.userId,
    });
    return results;
  } catch (err) {
    console.log("createCSVEntry error - ", err);
  }
};

const updateCSVEntry = async (userId, downloadUrl, csvExportId) => {
    try {
      let results = await db.none(UPDATE_CSV_EXPORT, {
        csvExportId: csvExportId.csv_export_id,
        userId: userId,
        downloadUrl: downloadUrl,
      });
      return results;
    } catch (err) {
      console.log("updatecreateCSVEntry error - ", err);
    }
};

const getCSVEntry = async (userId) => {
    try {
      let results = await db.any(CSV_EXPORT, {
        userId: userId,
      });
      return results;
    } catch (err) {
      console.log("getCSVEntry error - ", err);
    }
};

const removeCSVEntry = async (csvExportId, userId) => {
  try {
    let results = await db.any(REMOVE_CSV_EXPORT, {
      csvExportId: csvExportId,
      user_id: userId
    });
    return results;
  } catch (err) {
    console.log("removeCSVEntry error - ", err);
  }
};

const uploadCSVFile = async (params, csv_export_id) => {
  let queryResults = null;
  if (params.page == 'search') {
    queryResults = await getSearchDownloadResults(params);
  } else {
    queryResults = await getCollectionResults(params);
  }
  // console.log(JSON.stringify(queryResults));
  const fileUpload = await createCSVDataDump(params.type, queryResults);
  let filename = csv_export_id.csv_export_id + ".csv";
  let uploadData = await uploadCSVToAWS(fileUpload, filename);
  let updateExportEntry = await updateCSVEntry(params.req.user.id, uploadData, csv_export_id);
}



const processCSVFile = async (params, paramsForCSV) => {
  try {
    // Build the payload for your Lambda
    const payloadParams = {
      user_query: params.user_query ? params.user_query : '',
      limit: params.limit ? params.limit : null,
      langQuery: params.langQuery,
      lang: params.lang,
      type: params.type,
      parsed_query: params.parsed_query,
      page: params.page,
      bucket: process.env.AWS_S3_BUCKET,
      userId: params.req.user.id
    }
    const filters = await getParamsSearchDownloadResults(params);

    const payloadLambda = JSON.stringify({
      ...payloadParams, 
      filters: filters, 
      paramsForCSV: paramsForCSV
    });

    // Decide which Lambda function name to use based on environment
    let functionName = "generate-csv";
    if (process.env.NODE_ENV === "production") {
      functionName = "generate-csv-prod";
    }

    // Prepare parameters for InvokeCommand
    const paramsLambda = {
      FunctionName: functionName,
      Payload: Buffer.from(payloadLambda), // must be a Uint8Array/Buffer in v3
    };

    // Invoke Lambda using the new AWS SDK v3
    const command = new InvokeCommand(paramsLambda);
    const result = await lambdaClient.send(command);
    console.log("Lambda result:", result);
    // If your Lambda returns a JSON payload, you can decode and parse it:
    // if (result.Payload) {
    //   const decodedPayload = new TextDecoder("utf-8").decode(result.Payload);
    //   console.log("Decoded Lambda payload:", decodedPayload);
    //   // const jsonPayload = JSON.parse(decodedPayload);
    //   // do something with jsonPayload if needed
    // }

    // let paramsLambda = { FunctionName: 'generate-csv', Payload: payloadLambda};
    // if(process.env.NODE_ENV === 'production'){
    //   paramsLambda = {FunctionName: 'generate-csv-prod', Payload: payloadLambda};
    // }

    // const result = await lambda.invoke(paramsLambda).promise();
    console.log(' lambda result ', result);
  } catch (error) {
    console.log('lambda error ', error);
    throw error;
  }
}

module.exports = {
    createCSVEntry,
    getCSVEntry,
    updateCSVEntry,
    removeCSVEntry,
    uploadCSVFile,
    processCSVFile,
  };