"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let log = require("winston");
let jwt = require("express-jwt");
let equals = require("deep-equal");
let moment = require("moment");

let {
  db,
  sql,
  as,
  helpers,
  getXByIdFns,
  diffRelatedList
} = require("../helpers/db");
let { getUserIfExists } = require("../helpers/user");

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

const {
  getCaseById_lang_userId,
  getCaseByRequest,
  returnCaseById
} = getXByIdFns("case", getUserIfExists);

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
    let language = req.params.language || "en";
    if (!(title && body)) {
      return res.status(400).json({
        message: "Cannot create Case, both title and body are required"
      });
    }
    const user_id = req.user.user_id;
    const location = as.location(req.body.location);
    const videos = as.videos(req.body.vidURL);
    const lead_image = as.attachment(req.body.lead_image); // frontend isn't sending this yet
    const case_id = await db.one(
      sql("../sql/create_case.sql"),
      Object.assign({}, empty_case, {
        title,
        body,
        location,
        lead_image,
        videos,
        user_id
      })
    );
    // save related objects (needs case_id)
    const relCases = as.related_list(
      "case",
      case_id.case_id,
      "case",
      req.body.related_cases
    );
    if (relCases) {
      await db.none(relCases);
    }
    const relMethods = as.related_list(
      "case",
      case_id.case_id,
      "method",
      req.body.related_methods
    );
    if (relMethods) {
      await db.none(relMethods);
    }
    const relOrgs = as.related_list(
      "case",
      case_id.case_id,
      "organization",
      req.body.related_organizations
    );
    if (relOrgs) {
      await db.none(relOrgs);
    }

    const newCase = await getCaseById_lang_userId(
      case_id.case_id,
      language,
      user_id
    );
    return res.status(201).json({
      OK: true,
      data: case_id,
      object: newCase
    });
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

router.put("/:caseId", async function editCaseById(req, res) {
  cache.clear();
  try {
    // FIXME: Figure out how to get all of this done as one transaction
    const caseId = as.number(req.params.caseId);
    const lang = as.value(req.params.language || "en");
    const userId = req.user.user_id;
    const oldCase = await getCaseById_lang_userId(caseId, lang, userId);
    const newCase = req.body;
    let updatedText = {
      body: oldCase.body,
      title: oldCase.title,
      language: lang,
      type: "case",
      id: oldCase.id
    };
    let updatedCaseFields = [];
    let isTextUpdated = false;
    let anyChanges = false;
    let retCase = null;
    /* DO ALL THE DIFFS */
    Object.keys(oldCase).forEach(async key => {
      if (
        // All the ways to check if a value has not changed
        newCase[key] === undefined ||
        equals(oldCase[key], newCase[key]) ||
        (/_date/.test(key) &&
          moment(oldCase[key]).format() === moment(newCase[key]).format()) ||
        (/related_/.test(key) &&
          equals(
            oldCase[key].map(x => x.id),
            newCase[key].map(x => x.id || x.value)
          ))
      ) {
        // skip, do nothing, no change for this key
      } else if (!equals(oldCase[key], newCase[key])) {
        anyChanges = true;
        // If the body or title have changed: add a record in case__localized_texts
        if (key === "body" || key === "title") {
          updatedText[key] = newCase[key];
          isTextUpdated = true;
          // If related_cases, related_methods, or related_organizations have changed
          // update records in related_nouns
        } else if (
          [
            "related_cases",
            "related_methods",
            "related_organizations"
          ].includes(key)
        ) {
          // DELETE / INSERT any needed rows for related_nouns
          const oldList = oldCase[key];
          const newList = newCase[key];
          newList.forEach(x => x.id = x.id || x.value); // handle client returning value vs. id
          const diff = diffRelatedList(oldList, newList);
          const relType = key.split("_")[1].slice(0, -1); // related_Xs => X
          const add = as.related_list(
            oldCase.type,
            oldCase.id,
            relType,
            diff.add.map(x => x.id)
          );
          const remove = as.remove_related_list(
            oldCase.type,
            oldCase.id,
            relType,
            diff.remove.map(x => x.id)
          );
          if (add || remove) {
            console.log(">>>%s<<<", add + remove);
            await db.none(add + remove);
          }
          anyChanges = true;
          // If any of the fields of case itself have changed, update record in cases
        } else if (["id", "post_date", "updated_date"].includes(key)) {
          console.warn(
            "Trying to update a field users shouldn't update: %s",
            key
          );
          // take no action
        } else if (key === "featured" && !user.groups.includes("Curators")) {
          console.warn("Non-curator trying to update Featured flag");
          // take no action
        } else if (key === "location") {
          updatedCaseFields.push({
            key: as.name(key),
            value: as.location(newCase[key])
          });
        } else if (key === "lead_image") {
          var img = newCase[key];
          updatedCaseFields.push({
            key: as.name(key),
            value: as.attachment(img.url, img.title, img.size)
          });
        } else if (["other_images", "files"].includes(key)) {
          updatedCaseFields.push({
            key: as.name(key),
            value: as.attachments(newCase[key])
          });
        } else {
          console.log(
            "Unspecified change found in %s: %s != %s",
            key,
            oldCase[key],
            newCase[key]
          );
          let value = oldCase[key];
          let asValue = as.text;
          if (typeof value === "boolean") {
            asValue = as.value;
          } else if (value === null) {
            value = "null";
            asValue = as.value;
          } else if (typeof value === "number") {
            asValue = as.number;
          }
          updatedCaseFields.push({
            key: as.name(key),
            value: asValue(value)
          });
        }
      }
    }); // end of for loop over object keys
    if (anyChanges) {
      // Actually make the changes
      if (isTextUpdated) {
        // INSERT new text row
        await db.none(sql("../sql/insert_localized_text.sql"), updatedText);
      }
      // Update last_updated
      updatedCaseFields.push({ key: "updated_date", value: as.text("now") });
      // UPDATE the case row
      await db.none(sql("../sql/update_noun.sql"), {
        keyvalues: updatedCaseFields
          .map(field => field.key + " = " + field.value)
          .join(", "),
        type: "case",
        id: oldCase.id
      });
      // INSERT row for case__authors
      await db.none(sql("../sql/insert_author.sql"), {
        user_id: userId,
        type: "case",
        id: oldCase.id
      });
      // update materialized view for search
      retCase = await getCaseById_lang_userId(
        as.number(req.params.caseId),
        lang,
        userId
      );
    } else {
      // end if anyChanges
      retCase = oldCase;
    } // end if not anyChanges
    res.status(200).json({ OK: true, data: retCase });
  } catch (error) {
    log.error("Exception in PUT /case/%s => %s", req.params.caseId, error);
    res.status(500).json({
      OK: false,
      error: error
    });
  } // end catch
});

/**
 * @api {get} /case/:caseId Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnCaseById
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

// We want to extract the user ID from the auth token if it's there,
// but not fail if not.
router.get(
  "/:caseId",
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"]
  }),
  returnCaseById
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
