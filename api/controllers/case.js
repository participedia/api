"use strict";
var express = require("express");
var router = express.Router();
var groups = require("../helpers/groups");
var es = require("../helpers/es");
var ddb = require("../helpers/ddb");
var cache = require("apicache");
var AWS = require("aws-sdk");
var getAuthorByAuthorID = require("../helpers/getAuthor");
var log = require("winston");
var Bodybuilder = require("bodybuilder");
var jsonStringify = require("json-pretty");

var { db, sql } = require("../helpers/db");

/**
 * @api {get} /case/countsByCountry Get case counts for each country
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName countsByCountry
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data Mapping of country names to counts (when `OK` is true)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *          countryCounts: {
 *            "United States": 122,
 *            "United Kingdom": 57,
 *            "Italy": 51,
 *            ...
 *        }
 *     }
 * })
 */

// TODO: figure out if the choropleth should show cases or all things

router.get("/countsByCountry", function(req, res) {
  db
    .any(sql("../sql/cases_by_country.sql"))
    .then(function(countries) {
      // convert array to object
      var countryCounts = {};
      countries.forEach(function(row) {
        countryCounts[row.country.toLowerCase()] = row.count;
      });
      res.status(200).json({
        OK: true,
        data: {
          countryCounts: countryCounts
        }
      });
    })
    .catch(function(error) {
      log.error("Exception in /case/countsByCountry => %s", error);
      res.status(500).json({
        OK: false,
        error: error
      });
    });
});

/**
 * @api {post} /case/new Create new case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName newCase
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
router.post("/new", function(req, res, next) {
  groups.user_has(
    req,
    "Contributors",
    function() {
      res.status(401).json({
        message: "access denied - user does not have proper authorization"
      });
    },
    function() {
      // create new `case` in db
      // req.body *should* contain:
      //   title
      //   body (or "summary"?)
      //   photo
      //   video
      //   location
      //   related cases
      var title = req.body.title;
      var body = req.body.summary;
      if (!(title && body)) {
        res.status(400).json({
          message: "Cannot create Case, both title and summary are required"
        });
      }
      console.log("Create new case for %s", req.body);
      res.status(201).json({
        OK: true,
        data: {
          title: title,
          body: body
        }
      });
    }
  );
});

/**
 * @api {put} /case/:caseId  Submit a new version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName editCase
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.put("/:caseId", function editCaseById(req, res) {
  cache.clear();
  groups.user_has(
    req,
    "Contributors",
    function() {
      console.error("user doesn't have Contributors group membership");
      res.status(401).json({
        message: "access denied - user does not have proper authorization"
      });
      return;
    },
    function() {
      var caseId = req.swagger.params.caseId.value;
      var caseBody = req.body;
      res.status(200).json(req.body);
    }
  );
});

/**
 * @api {get} /case/:caseId Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName getCaseById
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.get("/:caseId", function getCaseById(req, res) {
  db
    .one(sql("../sql/case_by_id.sql"), {
      caseId: req.params.caseId,
      lang: req.params.language || "en"
    })
    .then(function(the_case) {
      res.status(200).json({
        OK: true,
        data: the_case
      });
    })
    .catch(function(error) {
      log.error("Exception in GET /case/%s => %s", req.params.caseId, error);
      res.status(500).json({
        OK: false,
        error: error
      });
    });
});

/**
 * @api {delete} /case/:caseId Delete a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName deleteCase
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        OK: true
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.delete("/:caseId", function editCaseById(req, res) {
  cache.clear();
  groups.user_has(
    req,
    "Contributors",
    function() {
      console.error("user doesn't have Contributors group membership");
      res.status(401).json({
        message: "access denied - user does not have proper authorization"
      });
      return;
    },
    function() {
      var caseId = req.swagger.params.caseId.value;
      var caseBody = req.body;
      res.status(200).json(req.body);
    }
  );
});

module.exports = router;
