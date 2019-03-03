"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");
const equals = require("deep-equal");

const {
  db,
  as,
  CASES_BY_COUNTRY,
  CREATE_CASE,
  CASE_EDIT_BY_ID,
  CASE_EDIT_STATIC,
  CASE_VIEW_BY_ID,
  CASE_VIEW_STATIC,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_CASE
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
    getEditXById("case")(req, res);
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
    res.status(500).json({ OK: false, error: error });
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

async function maybeUpdateUserText(req, res) {
  // if none of the user-submitted text fields have changed, don't add a record
  // to localized_text or
  const newCase = req.body;
  const params = parseGetParams(req, "case");
  const oldCase = (await db.one(CASE_VIEW_BY_ID, params)).results;
  let textModified = false;
  const updatedText = {
    body: oldCase.body,
    title: oldCase.title,
    description: oldCase.description,
    language: params.lang,
    type: "case",
    id: params.articleid
  };
  ["body", "title", "description"].forEach(key => {
    if (newCase[key] !== oldCase[key]) {
      textModified = true;
      updatedText[key] = oldCase[key];
    }
  });
  if (textModified) {
    const author = {
      user_id: params.userid,
      type: "case",
      id: params.articleid
    };
    return { updatedText, author, oldCase };
  } else {
    return { updateText: null, author: null, oldCase };
  }
}

function getUpdatedCase(user, params, newCase, oldCase) {
  const updatedCase = {};
  // admin-only
  if (user.isadmin) {
    updatedCase.featured = as.boolean(newCase.featured);
    updatedCase.hidden = as.boolean(newCase.hidden);
    updatedCase.original_language = as.text(newCase.original_langauge);
    updatedCase.post_date = as.date(newCase.post_date);
  } else {
    updatedCase.featured = as.boolean(oldCase.featured);
    updatedCase.hidden = as.boolean(oldCase.hidden);
    updatedCase.original_language = as.text(oldCase.original_language);
    updatedCase.post_date = as.date(oldCase.post_date);
  }
  // media lists
  [
    "files",
    "links",
    "videos",
    "audio",
    "evaluation_reports",
    "evaluation_links"
  ].map(key => (updatedCase[key] = as.media(newCase[key])));
  // photos are slightly different from other media as they have a source url too
  updatedCase.photos = as.photos(newCase.photos);
  // boolean (would include "published" but we don't really support it)
  ["ongoing", "staff", "volunteers"].map(
    key => (updatedCase[key] = as.boolean(newCase[key]))
  );
  // yes/no (convert to boolean)
  ["impact_evidence", "formal_evaluation"].map(
    key => (updatedCase[key] = as.yesno(newCase[key]))
  );
  // number
  ["number_of_participants"].map(
    key => (updatedCase[key] = as.integer(newCase[key]))
  );
  // plain text
  [
    "location_name",
    "address1",
    "address2",
    "city",
    "province",
    "postal_code",
    "country",
    "latitude",
    "longitude",
    "funder"
  ].map(key => (updatedCase[key] = as.text(newCase[key])));
  // date
  ["start_date", "end_date"].map(
    key => (updatedCase[key] = as.date(newCase[key]))
  );
  // id
  ["is_component_of", "primary_organizer"].map(
    key => (updatedCase[key] = as.id(newCase[key]))
  );
  // list of ids
  updatedCase.specific_methods_tools_techniques = as.ids(
    newCase.specific_methods_tools_techniques
  );
  // key
  [
    "scope",
    "public_spectrum",
    "legality",
    "facilitators",
    "facilitator_training",
    "facetoface_online_or_both"
  ].map(key => (updatedCase[key] = as.casekey(newCase[key])));
  // list of keys
  [
    "general_issues",
    "specific_topics",
    "time_limited",
    "purposes",
    "approaches",
    "open_limited",
    "recruitment_method",
    "targeted_participants",
    "method_types",
    "participants_interactions",
    "learning_resources",
    "decision_methods",
    "if_voting",
    "insights_outcomes",
    "organizer_types",
    "funder_types",
    "change_types",
    "implementers_of_change",
    "tools_techniques_types"
  ].map(key => (updatedCase[key] = as.casekeys(key, newCase[key])));
  // special list of keys
  updatedCase.tags = as.tagkeys(newCase.tags);
  updatedCase.id = params.articleid;
  // TODO save bookmarked on user
  return updatedCase;
}

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
// time_limited, convert to list of keys
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

router.post("/:thingid", async (req, res) => {
  cache.clear();
  const params = parseGetParams(req, "case");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  try {
    const newCase = req.body;
    console.log("Received from client: >>> \n%s\n", JSON.stringify(newCase));
    // save any changes to the user-submitted text
    const { updatedText, author, oldCase } = maybeUpdateUserText(req, res);
    const updatedCase = getUpdatedCase(user, params, newCase, oldCase);
    console.warn("updatedCase: %s", JSON.stringify(updatedCase));
    if (updatedText) {
      await db.tx("update-case", t => {
        return t.batch([
          t.none(INSERT_AUTHOR, author),
          t.none(INSERT_LOCALIZED_TEXT, updatedText),
          t.none(UPDATE_CASE, updatedCase),
          t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    } else {
      await db.tx("update-case", t => {
        return t.batch([
          t.none(UPDATE_CASE, updatedCase),
          t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    }
    res.redirect(req.originalUrl.replace("/edit", ""));
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
