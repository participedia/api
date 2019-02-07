"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");

const {
  db,
  as,
  CASES_BY_COUNTRY,
  CREATE_CASE,
  CASE_EDIT_BY_ID,
  CASE_EDIT_STATIC,
  CASE_VIEW_BY_ID,
  CASE_VIEW_STATIC
} = require("../helpers/db");

const {
  getEditXById,
  addRelatedList,
  parseGetParams,
  returnByType,
  fixUpURLs
} = require("../helpers/things");

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
  try {
    cache.clear();

    let title = req.body.title;
    let body = req.body.body || req.body.summary || "";
    let description = req.body.description;
    let language = req.params.language || "en";
    if (!title) {
      return res.status(400).json({
        message: "Cannot create Case without at least a title"
      });
    }
    const user_id = req.user.id;
    const thing = await db.one(CREATE_CASE, {
      title,
      body,
      description,
      language
    });
    req.thingid = thing.thingid;
    return getEditXById("case")(req, res);
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
  // Refresh search index
  // FIXME: This will never get called as we have already returned ff
  try {
    db.none("REFRESH MATERIALIZED VIEW CONCURRENTLY search_index_en;");
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
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

router.post("/:thingid/edit", async (req, res) => {
  // Only changs to title, description, and/or body trigger a new author and version

  // id, integer, immutable
  // type, 'case', immutable
  // title, plain text, new entry in localized_textx
  // general issues => convert to list of ids
  // specific topics => convert to list of ids
  // description plain text, new entry in localized texts
  // body, html needing sanitization, new entry in localized texts
  // tags, convert to list of keys
  // location_name
  // address1,
  // address2,
  // city,
  // province,
  // postal_code,
  // country,
  // latitude => null if 0'0"
  // longitude => null if 0'0"
  // scope, conert to key
  // has_components, immutable for now, discard
  // is_component_of, convert to id
  // files => full_files
  // links => full_links,
  // photos,
  // videos => full_videos,
  // audio,
  // start_date,
  // end_date,
  // ongoing,
  // tieme_limited, convert to list of keys
  // purposes, convert to list of keys
  // approaches, convert to list of keys
  // public_spectrum, convert to key
  // number_of_participants,
  // open_limited, convert to list of tags
  // recruitment_method, convert to tag
  // targeted_participants, convert to list of tags
  // method_types, convert to list of tags
  // tools_techniques, types, convert to list of tags
  // specific_methods_tools_techniques, convert to list of ids
  // legality, convert to tag
  // facilitators, convert to tag
  // facilitator_training, convert to tag
  // facetoface_online_or_both, convert to tag
  // participants_interactions, convert to list of tags
  // learning_resources, convert to list of tags
  // decision_methods, convert to list of tags
  // if_voting, convert to list of tags
  // insights_outcomes, convert to list of tags
  // primary_organizer, convert to id
  // organizer_types, convert to list of tags
  // funder, plain text
  // funder_types, convert to list of tags
  // staff, boolean
  // volunteers, boolean
  // impact_evidence, yes or no
  // change_types, convert to list of tags
  // implementers_of_change, convert to list of tags
  // formal_evaluation, yes or no
  // evaluation_reports, list of urls, strip off prefix
  // evaluation_links, list of urls, strip off prefix
  // bookmarked, list on user
  // creator, immutable, discard
  // last_updated_by, automatic, discard
  // original_language, immutable unless changed by admin
  // post_date, immutable unless changed by admin
  // published, true/false
  // updated_date, automatic, discard
  // featured, immutable unless changed by admin
  // hidden, immutable unless changed by admin
    cache.clear();
    const params = parseGetParams(req, "case");
    const {articleid, type, view, userid, lang, returns} = params;
    let user,
      oldThing,
      newThing,
      updatedText,
      updatedThingFields = [],
      isTextUpdated = false,
      anyChanges = false,
      retThing = null;
    try {
      // FIXME: Figure out how to get all of this done as one transaction
      lang = as.value(req.params.language || "en");
      user = req.user;
      userId = user.user_id;
      const articleRow = await db.one(CASE_VIEW_BY_ID, params);
      const oldThing = articleRow.results;

      newThing = req.body;
      console.log("Received from client: >>> \n%s\n", JSON.stringify(newThing));
      console.log("User: %s", JSON.stringify(user));
      updatedText = {
        body: oldThing.body,
        title: oldThing.title,
        description: oldThing.description,
        language: lang,
        type: type,
        id: articleid
      };

      /* DO ALL THE DIFFS */
      // FIXME: Does this need to be async?
      Object.keys(oldThing).forEach(async key => {
        // console.error("checking key %s", key);
        const prevValue = oldThing[key];
        let value = newThing[key];
        if (key === "body" && value === "case_body_placeholder") {
          value = "";
        }
        if (
          // All the ways to check if a value has not changed
          // Fixme, check list of ids vs. list of {id, title} pairs
          value === undefined ||
          equals(prevValue, value) ||
          (/_date/.test(key) &&
            moment(prevValue).format() === moment(value).format())
        ) {
          // skip, do nothing, no change for this key
        } else if (!equals(prevValue, value)) {
          anyChanges = true;
          // If the body, title, or description have changed: add a record in localized_texts
          if (key === "body" || key === "title" || key == "description") {
            updatedText[key] = value;
            isTextUpdated = true;
            // If any of the fields of thing itself have changed, update record in appropriate table
          } else if (
            [
              "id",
              "post_date",
              "updated_date",
              "authors",
              "creator",
              "last_updated_by"
            ].includes(key)
          ) {
            log.warn(
              "Trying to update a field users shouldn't update: %s",
              key
            );
            // take no action
          } else if (key === "featured" || key === "hidden") {
            if (user.isadmin) {
              updatedThingFields.push({
                key: as.name(key),
                value: Boolean(value)
              });
            } else {
              log.warn(
                "Non-admin trying to update Featured/hidden flag: %s",
                JSON.stringify(user)
              );
              // take no action
            }
          } else if (
            // fields that are lists of strings
            [
              "tags",
              "links",
              "images",
              "videos",
              "files",
              "if_voting",
              "evaluation_reports",
              "evaluation_links"
            ].includes(key)
          ) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.strings(value)
            });
          } else if (
            // fields that are arrays of text (localized), value pairs
            [
              "issues",
              "relationships",
              "specific_topics",
              "approaches",
              "change_types",
              "decision_methods",
              "funder_types",
              "implementers_of_change",
              "insights_outcomes",
              "learning_resources",
              "organizer_types",
              "purposes",
              "participants_interactions",
              "targeted_participants",
              "typical_purposes",
              "communication_outcomes",
              "communication_modes"
            ].includes(key)
          ) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.localed(value)
            });
          } else if (key === "is_component_of") {
            let component_id = value;
            if (value === null) {
              // delete any existing value
            } else if (typeof value !== "number") {
              component_id = value.value;
            }
            if (component_id !== thingid) {
              if (oldThing.is_component_of !== component_id) {
                updatedThingFields.push({
                  key: as.name(key),
                  value: component_id ? as.number(component_id) : null
                });
              }
            } else {
              // console.warn(
              //   "Do NOT try to add an element as a component of itself or I WILL smack you."
              // );
            }
          } else if (key === "has_components") {
            /* Allow has_components to update those other cases */
            /* trickier, need to make current component the is_component_of for each id */
            /* objects are {label, text, value} where value is the id */
            /* FUCK this gets hard when trying to remove items, and is easily broken by multiple users, remove it */
            // DO NOTHING
          } else if (["process_methods", "primary_organizers"].includes(key)) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.array(value.map(x => x.value))
            });
          } else if (key === "bookmarked") {
            /* FIXME: Move bookmarked API to be a normal update */
            /* stored in a separate table, tied to user */
            console.error("bookmarked: %s", newThing[key]);
          } else if (key === "primary_organizers") {
            updatedThingFields.push({
              key: as.name(key),
              value: as.ids(newThing[key])
            });
          } else {
            let value = newThing[key];
            let asValue = as.text;
            if (typeof value === "boolean") {
              asValue = as.value;
            } else if (value === null) {
              value = "null";
              asValue = as.value;
            } else if (typeof value === "number") {
              asValue = as.number;
            }
            updatedThingFields.push({
              key: as.name(key),
              value: asValue(value)
            });
          }
        }
      }); // end of for loop over object keys
      // console.error("looped through all keys");
      if (true) {
        // Actually make the changes
        if (isTextUpdated) {
          // INSERT new text row
          await db.none(INSERT_LOCALIZED_TEXT, updatedText);
        }
        // Update last_updated
        updatedThingFields.push({ key: "updated_date", value: as.text("now") });
        // UPDATE the thing row
        await db.none(UPDATE_NOUN, {
          keyvalues: updatedThingFields
            .map(field => field.key + " = " + field.value)
            .join(", "),
          type: type,
          id: thingid
        });
        // INSERT row for X__authors
        await db.none(INSERT_AUTHOR, {
          user_id: userId,
          type: type,
          id: thingid
        });
        // update materialized view for search
        retThing = await getThingByType_id_lang_userId_view(
          type,
          as.number(thingid),
          lang,
          userId,
          view
        );
        if (req.thingid) {
          res.status(201).json({
            OK: true,
            article: retThing
          });
        } else {
          res.status(200).json({ OK: true, article: retThing });
        }
      }
    } catch (error) {
      log.error(
        "Exception in PUT /%s/%s => %s",
        type,
        req.thingid || articleid,
        error
      );
      console.trace(error);
      res.status(500).json({
        OK: false,
        error: error
      });
    } // end catch
    // update search index
    try {
      db.none("REFRESH MATERIALIZED VIEW search_index_en;");
    } catch (error) {
      console.error("Problem refreshing materialized view: %s", error);
    }

});

/**
 * @api {get} /case/:thingid Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnCaseById
 * @apiParam {Number} thingid Case ID
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

router.get("/:thingid/", async (req, res) => {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "case");
  const articleRow = await db.one(CASE_VIEW_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticText = await db.one(CASE_VIEW_STATIC, params);
  returnByType(res, params, article, staticText, req.user);
});

router.get("/:thingid/edit", async (req, res) => {
  const params = parseGetParams(req, "case");
  params.view = "edit";
  const articleRow = await db.one(CASE_EDIT_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticResults = await db.one(CASE_EDIT_STATIC, params);
  const staticText = staticResults.static;
  const authorsResult = await db.one(
    "SELECT to_json(array_agg((id, name)::object_title)) AS authors FROM users;"
  );
  staticText.authors = authorsResult.authors;
  const casesResult = await db.one(
    "SELECT to_json(get_object_title_list(array_agg(cases.id), ${lang})) as cases from cases;",
    params
  );
  staticText.cases = casesResult.cases;
  const methodsResult = await db.one(
    "SELECT to_json(get_object_title_list(array_agg(methods.id), ${lang})) as methods from methods;",
    params
  );
  staticText.methods = methodsResult.methods;
  returnByType(res, params, article, staticText, req.user);
});


module.exports = router;
