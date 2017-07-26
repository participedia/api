"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const log = require("winston");

const { db, sql, as } = require("../helpers/db");
const { supportedTypes } = require("../helpers/things");

const LIST_TITLES = sql("../sql/list_titles.sql");
const LIST_SHORT = sql("../sql/list_short.sql");
//const LIST_REFERENCES = sql("../sql/list_references.sql");

/**
 * @api {get} /list/titles Get title and id for all "things"
 * @apiGroup List
 * @apiVersion 0.1.0
 * @apiName listTitles
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} method data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *          'case': [{id: 1, title: "example 1"}, ...}],
 *          "method": [{id: 101, title: "example 2"}, ...}],
 *          "organization": [{id: 201: "example 3"}, ...}]
 *        }
 *     }
 */

router.get("/titles", async (req, res) => {
  try {
    const language = req.params.language || "en";
    const query = await db.one(LIST_TITLES, { language });
    // query.results.forEach(item =>
    let retVal = {};
    query.results.forEach(thing => {
      retVal[thing.type + "s"] = thing.array_agg;
    });
    res.status(200).json({ OK: true, data: retVal });
  } catch (error) {
    console.trace("Exception in POST /list/titles => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

router.get("/short", async (req, res) => {
  try {
    const language = req.params.language || "en";
    const query = await db.one(LIST_SHORT, { language });
    let retVal = {};
    query.results.forEach(thing => {
      retVal[thing.type + "s"] = thing.array_agg;
    });
    res.status(200).json({ OK: true, data: retVal });
  } catch (error) {
    console.trace("Exception in POST /list/short => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

router.get("/:type", async (req, res) => {
  try {
    if (!supportedTypes.includes(req.params.type.toLowerCase())) {
      return res
        .status(404)
        .json({ OK: false, error: `Type ${req.params.type} is not supported` });
    }
    const language = req.params.language || "en";
    const query = await db.one(LIST_REFERENCES, { language });
    res.status(200).json({ OK: true, data: query.results });
  } catch (error) {
    console.trace("Exception in POST /list/%s => %s", req.params.type, error);
    return res.status(500).json({ OK: false, error: error });
  }
});

module.exports = router;
