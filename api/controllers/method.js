"use strict";

const express = require("express");
const cache = require("apicache");
const log = require("winston");
const fs = require("fs");

const {
  db,
  as,
  CREATE_METHOD,
  METHOD_EDIT_BY_ID,
  METHOD_VIEW_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_METHOD,
  listUsers,
  ErrorReporter
} = require("../helpers/db");

const {
  setConditional,
  maybeUpdateUserText,
  parseGetParams,
  returnByType,
  fixUpURLs
} = require("../helpers/things");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

const METHOD_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/method-structure.json", "utf8")
);

const sharedFieldOptions = require("../helpers/shared-field-options.js");

async function getEditStaticText(params) {
  let staticText = {};
  staticText.authors = await listUsers();

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
    let language = req.params.language || "en";
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
      language
    });
    req.params.thingid = thing.thingid;
    await postMethodUpdateHttp(req, res);
  } catch (error) {
    log.error("Exception in POST /method/new => %s", error);
    res.status(400).json({ OK: false, error: error });
  }
  // Refresh search index
  // FIXME: This will never get called as we have already returned ff
  // try {
  //   db.none("REFRESH MATERIALIZED VIEW CONCURRENTLY search_index_en;");
  // } catch (error) {
  //   log.error("Exception in POST /method/new => %s", error);
  // }
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

async function getMethod(params) {
  const articleRow = await db.one(METHOD_VIEW_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  keyFieldsToObjects(article);
  return article;
}

function keyFieldsToObjects(article) {
  // nothing yet, but want to be compatible with cases
}

async function postMethodUpdateHttp(req, res) {
  cache.clear();
  const params = parseGetParams(req, "method");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newMethod = req.body;

  // console.log(
  //   "Received tools_techniques_types from client: >>> \n%s\n",
  //   JSON.stringify(newMethod.tools_techniques_types, null, 2)
  // );
  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle: oldMethod
  } = await maybeUpdateUserText(req, res, "method", keyFieldsToObjects);
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
          // t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    } else {
      await db.tx("update-method", t => {
        return t.batch([
          t.none(INSERT_AUTHOR, author),
          t.none(UPDATE_METHOD, updatedMethod)
          // t.none("REFRESH MATERIALIZED VIEW search_index_en;")
        ]);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    // console.log("Params for returning method: %s", JSON.stringify(params));
    const freshArticle = await getMethod(params);
    // console.log("fresh article: %s", JSON.stringify(freshArticle, null, 2));
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
  // boolean (would include "published" but we don't really support it)
  ["facilitators"].map(key => cond(key, as.yesno));
  // key
  [
    "facetoface_online_or_both",
    "public_spectrum",
    "open_limited",
    "recruitment_method",
    "level_polarization",
    "level_complexity"
  ].map(key => cond(key, as.methodkey));
  // integers
  ["number_of_participants"].map(key => cond(key, as.integer));
  // list of keys
  [
    "method_types",
    "scope_of_influence",
    "participants_interactions",
    "decision_methods",
    "if_voting"
  ].map(key => cond(key, as.methodkeys));
  // TODO save bookmarked on user
  return [updatedMethod, er];
}

async function getMethodHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "method");
  const articleRow = await db.one(METHOD_VIEW_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticText = {};
  returnByType(res, params, article, staticText);
}

async function getMethodEditHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  const articleRow = await db.one(METHOD_EDIT_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText);
}

async function getMethodNewHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  const article = METHOD_STRUCTURE;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/", getMethodHttp);
router.get("/:thingid/edit", requireAuthenticatedUser(), getMethodEditHttp);
router.get("/new", requireAuthenticatedUser(), getMethodNewHttp);
router.post("/new", requireAuthenticatedUser(), postMethodNewHttp);
router.post("/:thingid", requireAuthenticatedUser(), postMethodUpdateHttp);

module.exports = {
  method: router,
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp
};
