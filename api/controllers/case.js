"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let log = require("winston");
let jwt = require("express-jwt");

let { getUserIfExists } = require("../helpers/user");
let { db, sql, as } = require("../helpers/db");

const empty_case = {
  title: "",
  body: "",
  language: "en",
  user_id: null,
  original_language: "en",
  issue: null,
  communication_mode: null,
  communication_with_audience: null,
  content_country: null,
  decision_method: null,
  facetoface_online_or_both: null,
  facilitated: null,
  voting: "none",
  number_of_meeting_days: null,
  ongoing: false,
  total_number_of_participants: null,
  targeted_participant_demographic: "General Public",
  kind_of_influence: null,
  targeted_participants_public_role: "Lay Public",
  targeted_audience: "General Public",
  participant_selection: "Open to all",
  specific_topic: null,
  staff_type: null,
  type_of_funding_entity: null,
  typical_implementing_entity: null,
  typical_sponsoring_entity: null,
  who_else_supported_the_initiative: null,
  who_was_primarily_responsible_for_organizing_the_initiative: null,
  location: null,
  lead_image_url: "",
  other_images: "{}",
  files: "{}",
  videos: "{}",
  tags: "{}",
  featured: false,
  bookmarked: false
};

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

router.get("/countsByCountry", async function getCountsByCountry(req, res) {
  try {
    const countries = await db.any(sql("../sql/cases_by_country.sql"));
    // convert array to object
    let countryCounts = {};
    countries.forEach(function(row) {
      countryCounts[row.country.toLowerCase()] = row.count;
    });
    res.status(200).json({
      OK: true,
      data: { countryCounts: countryCounts }
    });
  } catch (error) {
    log.error("Exception in /case/countsByCountry => %s", error);
    res.status(500).json({ OK: false, error: error });
  }
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

router.post("/new", async function postNewCase(req, res) {
  // create new `case` in db
  // req.body:
  /*
  {
     "title":"Safer Jam",
     "body":"Dangerous Body",
     "vidURL":"https://www.youtube.com/watch?v=QF7g3rCnD-w",
     "location":{
        "label":"Cleveland, OH, United States",
        "placeId":"ChIJLWto4y7vMIgRQhhi91XLBO0",
        "isFixture":false,
        "gmaps":{
           "address_components":[
              {
                 "long_name":"Cleveland",
                 "short_name":"Cleveland",
                 "types":[
                    "locality",
                    "political"
                 ]
              },
              {
                 "long_name":"Cuyahoga County",
                 "short_name":"Cuyahoga County",
                 "types":[
                    "administrative_area_level_2",
                    "political"
                 ]
              },
              {
                 "long_name":"Ohio",
                 "short_name":"OH",
                 "types":[
                    "administrative_area_level_1",
                    "political"
                 ]
              },
              {
                 "long_name":"United States",
                 "short_name":"US",
                 "types":[
                    "country",
                    "political"
                 ]
              }
           ],
           "formatted_address":"Cleveland, OH, USA",
           "geometry":{
              "bounds":{
                 "south":41.390628,
                 "west":-81.87897599999997,
                 "north":41.604436,
                 "east":-81.53274390000001
              },
              "location":{
                 "lat":41.49932,
                 "lng":-81.69436050000002
              },
              "location_type":"APPROXIMATE",
              "viewport":{
                 "south":41.390628,
                 "west":-81.87897599999997,
                 "north":41.5992571,
                 "east":-81.53274390000001
              }
           },
           "place_id":"ChIJLWto4y7vMIgRQhhi91XLBO0",
           "types":[
              "locality",
              "political"
           ]
        },
        "location":{
           "lat":41.49932,
           "lng":-81.69436050000002
        }
     }
  }
  */
  try {
    let title = req.body.title;
    let body = req.body.body || req.body.summary;
    if (!(title && body)) {
      return res.status(400).json({
        message: "Cannot create Case, both title and body are required"
      });
    }
    const user_id = req.user.user_id;
    const location = as.location(req.body.location);
    const videos = as.videos(req.body.vidURL);
    const lead_image = as.attachment(req.body.lead_image); // frontend isn't sending this yet
    const related_cases = as.related_list(req.body.related_cases);
    const related_methods = as.related_list(req.body.related_methods);
    const related_organizations = as.related_list(
      req.body.related_organizations
    );
    const case_id = await db.one(
      sql("../sql/create_case.sql"),
      Object.assign({}, empty_case, {
        title,
        body,
        location,
        lead_image,
        videos,
        related_cases,
        related_methods,
        related_organizations,
        user_id
      })
    );
    return res.status(201).json({ OK: true, data: case_id });
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
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
  // let caseId = req.swagger.params.caseId.value;
  // let caseBody = req.body;
  res.status(200).json(req.body);
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

async function getCaseById(req, res) {
  try {
    const caseId = as.number(req.params.caseId);
    const lang = as.value(req.params.language || "en");
    const the_case = await db.one(sql("../sql/case_by_id.sql"), {
      caseId,
      lang
    });
    const userId = await getUserIfExists(req);
    if (userId) {
      const bookmarked = await db.one(sql("../sql/bookmarked.sql"), {
        type: "case",
        thingId: caseId,
        userId: userId
      });
      the_case.bookmarked = bookmarked.case;
    } else {
      the_case.bookmarked = false;
    }
    res.status(200).json({ OK: true, data: the_case });
  } catch (error) {
    log.error("Exception in GET /case/%s => %s", req.params.caseId, error);
    res.status(500).json({
      OK: false,
      error: error
    });
  }
}

// We want to extract the user ID from the auth token if it's there,
// but not fail if not.
router.get(
  "/:caseId",
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"]
  }),
  getCaseById
);

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
  // let caseId = req.swagger.params.caseId.value;
  // let caseBody = req.body;
  res.status(200).json(req.body);
});

module.exports = router;
