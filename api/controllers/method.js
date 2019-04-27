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
  CASE_EDIT_STATIC
} = require("../helpers/db");

const {
  getEditXById,
  addRelatedList,
  parseGetParams,
  returnByType,
  fixUpURLs
} = require("../helpers/things");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

const METHOD_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/method-structure.json", "utf8")
);

const articleText = require("../../static-text/article-text.js");
const methodText = require("../../static-text/method-text.js");
const sharedFieldOptions = require("../helpers/shared-field-options.js");

async function getEditStaticText(params) {
  let staticText = (await db.one(CASE_EDIT_STATIC, params)).static;

  staticText = Object.assign({}, staticText, sharedFieldOptions);

  staticText.labels = Object.assign(
    {},
    staticText.labels,
    methodText,
    articleText
  );

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
  // req.body *should* contain:
  //   title
  //   body (or "summary"?)
  //   photo
  //   video
  //   location
  //   related methods
  try {
    cache.clear();

    let title = req.body.title;
    let body = req.body.body || req.body.summary || "";
    let description = req.body.description;
    let language = req.params.language || "en";
    if (!title) {
      return res.status(400).json({
        message: "Cannot create Method without at least a title"
      });
    }
    const user_id = req.user.user_id;
    const thing = await db.one(CREATE_METHOD, {
      title,
      body,
      description,
      language
    });
    req.thingid = thing.thingid;
    return getEditXById("method")(req, res);
  } catch (error) {
    log.error("Exception in POST /method/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
  // Refresh search index
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

const postMethodUpdateHttp = getEditXById("method");

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
