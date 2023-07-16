"use strict";
let express = require("express");

let {
  db,
  CREATE_CSV_REPORT,
  UPDATE_CSV_REPORT
} = require("../helpers/db");


const unixTimestampGeneration = () => {
  return Math.floor(Date.now() / 1000)
}

const generateCsvExportId = (userId) => {
  let unixTimestamp = unixTimestampGeneration();
  let csvExportId = userId.toString() + unixTimestamp.toString();

  return csvExportId;
}

const createCSVEntry = async (userId, type) => {
  let csvExportId = generateCsvExportId(userId);
    try {
      let results = await db.one(CREATE_CSV_REPORT, {
        csvExportId: csvExportId,
        type: type,
        userId: userId,
      });
      return results;
    } catch (err) {
      console.log("createCSVEntry error - ", err);
    }
};

const updateCSVEntry = async (userId, downloadUrl, csvExportId) => {
    try {
      let results = await db.none(UPDATE_CSV_REPORT, {
        csvExportId: csvExportId.csv_export_id,
        userId: userId,
        downloadUrl: downloadUrl,
      });
      return results;
    } catch (err) {
      console.log("updatecreateCSVEntry error - ", err);
    }
};

const getCSVFile = async () => {
    try {
      return "";
    } catch (err) {
      console.log("getCSVFile error - ", err);
    }
};

module.exports = {
    createCSVEntry,
    getCSVFile,
    updateCSVEntry,
  };