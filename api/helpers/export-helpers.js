"use strict";
let express = require("express");

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
  getCollectionResults
} = require("./search");

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
  const fileUpload = await createCSVDataDump(params.type, queryResults);
  let filename = csv_export_id.csv_export_id + ".csv";
  let uploadData = await uploadCSVToAWS(fileUpload, filename);
  let updateExportEntry = await updateCSVEntry(params.req.user.id, uploadData, csv_export_id);
}

module.exports = {
    createCSVEntry,
    getCSVEntry,
    updateCSVEntry,
    removeCSVEntry,
    uploadCSVFile,
  };