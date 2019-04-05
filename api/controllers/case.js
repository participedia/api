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
  UPDATE_CASE,
  ErrorReporter
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
    res.status(400).json({ OK: false, error: error });
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
  const oldCase = (await db.one(CASE_EDIT_BY_ID, params)).results;
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
      value = as.richtext(newCase[key] || oldCase[key]);
    } else {
      value = as.text(newCase[key] || oldCase[key]);
    }
    if (newCase[key] && oldCase[key] !== newCase[key]) {
      textModified = true;
    }
    updatedText[key] = value;
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

function setConditional(
  updatedObject,
  newObject,
  errorReporter,
  updateFunction,
  key
) {
  if (newObject[key] === undefined) {
    // if we're updating a partial, we still need to rewrite the updated object
    // from front-end format to save format
    updatedObject[key] = errorReporter.try(updateFunction)(
      updatedObject[key],
      key
    );
  } else {
    updatedObject[key] = errorReporter.try(updateFunction)(newObject[key], key);
  }
}

function getUpdatedCase(user, params, newCase, oldCase) {
  const updatedCase = Object.assign({}, oldCase);
  const er = new ErrorReporter();
  const cond = (key, fn) => setConditional(updatedCase, newCase, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("original_language", as.text);
    cond("post_date", as.date);
  }

  // media lists
  ["links", "videos", "audio", "evaluation_reports", "evaluation_links"].map(
    key => cond(key, as.media)
  );
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));
  // boolean (would include "published" but we don't really support it)
  ["ongoing", "staff", "volunteers"].map(key => cond(key, as.boolean));
  // yes/no (convert to boolean)
  ["impact_evidence", "formal_evaluation"].map(key => cond(key, as.yesno));
  // number
  ["number_of_participants"].map(key => cond(key, as.integer));
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
  ].map(key => cond(key, as.text));
  // date
  ["start_date", "end_date", "post_date"].map(key => cond(key, as.date));
  // id
  ["is_component_of", "primary_organizer"].map(key => cond(key, as.id));
  // list of ids
  ["specific_methods_tools_techniques"].map(key => cond(key, as.ids));
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
  ].map(key => cond(key, as.casekey));
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
  ].map(key => cond(key, as.casekeys));
  // special list of keys
  ["tags"].map(key => cond(key, as.tagkeys));
  // TODO save bookmarked on user
  return [updatedCase, er];
}

// Only changs to title, description, and/or body trigger a new author and version

router.post("/:thingid", updateCase);

async function updateCase(req, res) {
  // cache.clear();
  const params = parseGetParams(req, "case");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newCase = req.body;
  // console.log("Received from client: >>> \n%s\n", JSON.stringify(newCase));
  // save any changes to the user-submitted text
  const { updatedText, author, oldCase } = await maybeUpdateUserText(req, res);
  // console.log("updatedText: %s", JSON.stringify(updatedText));
  // console.log("author: %s", JSON.stringify(author));
  const [updatedCase, er] = getUpdatedCase(user, params, newCase, oldCase);
  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-case", t => {
        return t.batch([
          t.none(INSERT_AUTHOR, author),
          t.none(INSERT_LOCALIZED_TEXT, updatedText),
          t.none(UPDATE_CASE, updatedCase)
          // t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    } else {
      await db.tx("update-case", t => {
        return t.batch([
          t.none(UPDATE_CASE, updatedCase)
          // t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    // console.log("Params for returning case: %s", JSON.stringify(params));
    const freshArticle = await getCase(params);
    res.status(200).json({
      OK: true,
      article: freshArticle
    });
  } else {
    console.error("Reporting errors: %s", er.errors);
    res.status(400).json({
      OK: false,
      errors: er.errors
    });
  }
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
