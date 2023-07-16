"use strict";
let express = require("express");

let {
  db,
  CREATE_CSV_EXPORT,
  UPDATE_CSV_EXPORT,
  REMOVE_CSV_EXPORT,
  CSV_EXPORT
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
      let results = await db.one(CREATE_CSV_EXPORT, {
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

const removeCSVEntry = async csvExportId => {
  try {
    let results = await db.none(REMOVE_CSV_EXPORT, {
      csvExportId: csvExportId.csv_export_id
    });
    return results;
  } catch (err) {
    console.log("removeCSVEntry error - ", err);
  }
};

module.exports = {
    createCSVEntry,
    getCSVEntry,
    updateCSVEntry,
    removeCSVEntry,
  };