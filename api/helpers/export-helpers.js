"use strict";
let express = require("express");

let {
  db,
} = require("../helpers/db");

const createCSVFile = async () => {
    try {
      return "";
    } catch (err) {
      console.log("createCSVFile error - ", err);
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
    createCSVFile,
    getCSVFile,
  };