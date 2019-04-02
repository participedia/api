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

const articleText = require("../../static-text/article-text.js");

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
    //    req.thingid = thing.thingid;
    req.params.thingid = thing.thingid;
    updateCase(req, res);
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
    res.status(500).json({ OK: false, error: error });
  }
  // Refresh search index
  // FIXME: This will never get called as we have already returned ff
  // try {
  //   db.none("REFRESH MATERIALIZED VIEW CONCURRENTLY search_index_en;");
  // } catch (error) {
  //   log.error("Exception in POST /case/new => %s", error);
  // }
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
  if (!oldCase) {
    throw new Error("No case found for id %s", params.articleid);
  }
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
    let value;
    if (key === "body") {
      value = as.richtext(newCase[key]);
    } else {
      value = as.text(newCase[key]);
    }
    if (oldCase[key] !== value) {
      textModified = true;
      updatedText[key] = value;
    }
  });
  if (textModified) {
    const author = {
      user_id: params.userid,
      thingid: params.articleid
    };
    return { updatedText, author, oldCase };
  } else {
    return { updatedText: null, author: null, oldCase };
  }
}

function getUpdatedCase(user, params, newCase, oldCase) {
  const updatedCase = {};
  // admin-only
  if (user.isadmin) {
    updatedCase.featured = as.boolean(newCase.featured || false);
    updatedCase.hidden = as.boolean(newCase.hidden || false);
    updatedCase.original_language = as.text(newCase.original_language || "en");
    updatedCase.post_date = as.date(newCase.post_date || "now");
  } else {
    // need to check for oldCase otherwise get this error
    // error: Exception in PUT /case/5239 => TypeError: Cannot read property 'featured' of undefined
    // Trace: TypeError: Cannot read property 'featured' of undefined
    // at getUpdatedCase (/Users/alannascott/code/participedia/api/api/controllers/case.js:162:47)

    updatedCase.featured = as.boolean(oldCase.featured || false);
    updatedCase.hidden = as.boolean(oldCase.hidden || false);
    updatedCase.original_language = as.text(oldCase.original_language || "en");
    updatedCase.post_date = as.date(oldCase.post_date || "now");
  }
  // media lists
  [
    "files",
    "links",
    "videos",
    "audio",
    "evaluation_reports",
    "evaluation_links"
  ].map(key => {
    updatedCase[key] = as.media(newCase[key]);
  });
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(
    key => (updatedCase[key] = as.sourcedMedia(newCase[key]))
  );
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
    "original_language",
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
  ].map(key => (updatedCase[key] = newCase[key]));
  // date
  ["start_date", "end_date", "post_date"].map(
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
    "scope_of_influence",
    "public_spectrum",
    "legality",
    "facilitators",
    "facilitator_training",
    "facetoface_online_or_both",
    "open_limited",
    "recruitment_method",
    "time_limited"
  ].map(key => (updatedCase[key] = as.casekey(key, newCase[key])));
  // list of keys
  [
    "general_issues",
    "specific_topics",
    "purposes",
    "approaches",
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

router.post("/:thingid", updateCase);

async function updateCase(req, res) {
  cache.clear();
  const params = parseGetParams(req, "case");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  try {
    const newCase = req.body;
    // console.log("Received from client: >>> \n%s\n", JSON.stringify(newCase));
    // save any changes to the user-submitted text
    const { updatedText, author, oldCase } = await maybeUpdateUserText(
      req,
      res
    );
    // console.log("updatedText: %s", JSON.stringify(Object.keys(updatedText)));
    // console.log("author: %s", JSON.stringify(author));
    const updatedCase = getUpdatedCase(user, params, newCase, oldCase);
    // console.warn(
    //   "updatedCase before updating db: %s",
    //   JSON.stringify(updatedCase)
    // );
    Object.keys(updatedCase)
      .sort()
      .forEach(key =>
        console.log("updated %s => <| %s |>", key, updatedCase[key])
      );
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

    // the client expects this request to respond with json
    // save successful response
    console.log("Params for returning case: %s", JSON.stringify(params));
    res.status(200).json({
      OK: true,
      object: await getCase(params)
    });
  } catch (error) {
    log.error(
      "Exception in PUT /%s/%s => %s",
      type,
      req.thingid || articleid,
      error
    );
    console.trace(error);
    // validation error response
    // errors should be passed back to client as array of error messages
    res.status(200).json({
      OK: false,
      errors: ["Title can not be empty.", "Some other validation issue"]
    });
  } // end catch
}

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

async function getCase(params) {
  const articleRow = await db.one(CASE_VIEW_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  return article;
}

router.get("/:thingid/", async (req, res) => {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "case");
  const article = await getCase(params);
  const staticTextFromDB = await db.one(CASE_VIEW_STATIC, params);
  const staticText = Object.assign({}, staticTextFromDB, articleText);
  returnByType(res, params, article, staticText, req.user);
});

router.get("/:thingid/edit", async (req, res) => {
  const params = parseGetParams(req, "case");
  params.view = "edit";
  const article = await getCase(params);
  const staticResults = await db.one(CASE_EDIT_STATIC, params);
  let staticText = staticResults.static;
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

  staticText.labels = Object.assign({}, staticText.labels, articleText);
  returnByType(res, params, article, staticText, req.user);
});

module.exports = router;
