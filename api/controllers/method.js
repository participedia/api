"use strict";

const express = require("express");
const cache = require("apicache");
const fs = require("fs");

const {
  db,
  as,
  CREATE_METHOD,
  METHOD_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_METHOD,
  listUsers,
  refreshSearch,
  ErrorReporter
} = require("../helpers/db");

const {
  setConditional,
  maybeUpdateUserText,
  parseGetParams,
  returnByType,
  fixUpURLs
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

const METHOD_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/method-structure.json", "utf8")
);

const sharedFieldOptions = require("../helpers/shared-field-options.js");

async function getEditStaticText(params) {
  let staticText = {};
  try {
    staticText.authors = listUsers();
  } catch (e) {
    console.error("Error reading users");
  }

  staticText = Object.assign({}, staticText, sharedFieldOptions);

  return staticText;
}

/**
 * @api {post} /method/new Create new method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName newMethod
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data method data
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
async function postMethodNewHttp(req, res) {
  // create new `method` in db
  try {
    cache.clear();
    let title = req.body.title;
    let body = req.body.body || req.body.summary || "";
    let description = req.body.description;
    let original_language = req.body.original_language || "en";
    if (!title) {
      return res.status(400).json({
        OK: false,
        errors: ["Cannot create a method without at least a title."]
      });
    }
    const user_id = req.user.id;
    const thing = await db.one(CREATE_METHOD, {
      title,
      body,
      description,
      original_language
    });
    req.params.thingid = thing.thingid;
    await postMethodUpdateHttp(req, res);
  } catch (error) {
    logError(error, { errorMessage: "Exception in postMethodNewHttp" });
    res.status(400).json({ OK: false, error: error });
  }
}

/**
 * @api {put} /method/:id  Submit a new version of a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName editMethodById
 * @apiParam {Number} thingid Method ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data method data
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

async function getMethod(params, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return res.status(404).render("404");
    }
    const articleRow = await db.one(METHOD_BY_ID, params);
    const article = articleRow.results;
    fixUpURLs(article);
    return article;
  } catch (error) {
    // only log actual excaptional results, not just data not found
    if (error.message !== "No data returned from the query.") {
      logError(error, { errorMessage: "No entry found", params: params });
    }
    // if no entry is found, render the 404 page
    return res.status(404).render("404");
  }
}

async function postMethodUpdateHttp(req, res) {
  cache.clear();
  const params = parseGetParams(req, "method");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newMethod = req.body;

  // if this is a new method, we don't have a post_date yet, so we set it here
  if (!newMethod.post_date) {
    newMethod.post_date = Date.now();
  }

  // console.log(
  //   "Received tools_techniques_types from client: >>> \n%s\n",
  //   JSON.stringify(newMethod.tools_techniques_types, null, 2)
  // );
  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle: oldMethod
  } = await maybeUpdateUserText(req, res, "method");
  // console.log("updatedText: %s", JSON.stringify(updatedText));
  // console.log("author: %s", JSON.stringify(author));
  const [updatedMethod, er] = getUpdatedMethod(
    user,
    params,
    newMethod,
    oldMethod
  );
  // console.log("new method: \n%s", JSON.stringify(newMethod, null, 2));
  // console.log("old method: \n%s", JSON.stringify(oldMethod, null, 2));
  // console.log("updated method : \n%s", JSON.stringify(updatedMethod, null, 2));
  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-method", t => {
        return t.batch([
          t.none(INSERT_AUTHOR, author),
          t.none(INSERT_LOCALIZED_TEXT, updatedText),
          t.none(UPDATE_METHOD, updatedMethod)
        ]);
      });
    } else {
      await db.tx("update-method", t => {
        return t.batch([
          t.none(INSERT_AUTHOR, author),
          t.none(UPDATE_METHOD, updatedMethod)
        ]);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    // console.log("Params for returning method: %s", JSON.stringify(params));
    const freshArticle = await getMethod(params, res);
    // console.log("fresh article: %s", JSON.stringify(freshArticle, null, 2));
    res.status(200).json({
      OK: true,
      article: freshArticle
    });
    refreshSearch();
  } else {
    logError(er, {
      req,
      errorMessage: er.errors
    });
    res.status(400).json({
      OK: false,
      errors: er.errors
    });
  }
}

function getUpdatedMethod(user, params, newMethod, oldMethod) {
  const updatedMethod = Object.assign({}, oldMethod);
  const er = new ErrorReporter();
  const cond = (key, fn) =>
    setConditional(updatedMethod, newMethod, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("original_language", as.text);
    cond("post_date", as.date);
  }

  // media lists
  ["links", "videos", "audio"].map(key => cond(key, as.media));
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));
  // key
  [
    "facilitators",
    "facetoface_online_or_both",
    "public_spectrum",
    "open_limited",
    "recruitment_method",
    "level_polarization",
    "level_complexity"
  ].map(key => cond(key, as.methodkey));
  // list of keys
  [
    "method_types",
    "scope_of_influence",
    "participants_interactions",
    "number_of_participants",
    "decision_methods",
    "if_voting",
    "number_of_participants",
    "purpose_method"
  ].map(key => cond(key, as.methodkeys));
  // TODO save bookmarked on user
  return [updatedMethod, er];
}

async function getMethodHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "method");
  const article = await getMethod(params, res);
  const staticText = {};
  returnByType(res, params, article, staticText, req.user);
}

async function getMethodEditHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  const article = await getMethod(params, res);
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

async function getMethodNewHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  const article = METHOD_STRUCTURE;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getMethodEditHttp);
router.get("/new", requireAuthenticatedUser(), getMethodNewHttp);
router.post("/new", requireAuthenticatedUser(), postMethodNewHttp);
// these have to come *after* /new or BAD THINGS HAPPEN
router.get("/:thingid/", getMethodHttp);
router.post("/:thingid", requireAuthenticatedUser(), postMethodUpdateHttp);

module.exports = {
  method: router,
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp
};
