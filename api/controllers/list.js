"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const log = require("winston");

const { db, sql, as } = require("../helpers/db");

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
    const query = await db.one(sql("../sql/list_titles.sql"), { language });
    // query.results.forEach(item =>
    //   console.log("before munge: %s", Object.keys(item)));
    let retVal = {};
    query.results.forEach(thing => {
      retVal[thing.type + "s"] = thing.array_agg;
    });
    // console.log("after munge: %s", Object.keys(retVal));
    // console.log("cases: %s", retVal.cases.length);
    // console.log("methods: %s", retVal.methods.length);
    // console.log("organizations: %s", retVal.organizations.length);
    res.status(200).json({ OK: true, data: retVal });
  } catch (error) {
    console.trace("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

router.get("/short", async (req, res) => {
  try {
    const language = req.params.language || "en";
    const query = await db.one(sql("../sql/list_short.sql"), { language });
    let retVal = {};
    query.results.forEach(thing => {
      retVal[thing.type + "s"] = thing.array_agg;
    });
    res.status(200).json({ OK: true, data: retVal });
  } catch (error) {
    console.trace("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

router.get("/:type", async (req, res) => {
  try {
    const language = req.params.language || "en";
    const query = await db.one(sql("../sql/list_references.sql"), { language });
    res.status(200).json({ OK: true, data: query.results });
  } catch (error) {
    console.trace("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

module.exports = router;
