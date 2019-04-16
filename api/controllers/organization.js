"use strict";

const express = require("express");
const cache = require("apicache");
const log = require("winston");
const fs = require("fs");

const {
  db,
  as,
  CREATE_ORGANIZATION,
  ORGANIZATION_EDIT_BY_ID,
  ORGANIZATION_VIEW_BY_ID
} = require("../helpers/db");

const {
  getEditXById,
  addRelatedList,
  parseGetParams,
  returnByType,
  fixUpURLs
} = require("../helpers/things");

const ORGANIZATION_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/organization-structure.json", "utf8")
);

/**
 * @api {post} /organization/new Create new organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName newOrganization
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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
async function postOrganizationNewHttp(req, res) {
  // create new `organization` in db
  // req.body *should* contain:
  //   title
  //   body (or "summary"?)
  //   photo
  //   video
  //   location
  //   related organizations
  try {
    cache.clear();

    let title = req.body.title;
    let body = req.body.body || req.body.summary || "";
    let description = req.body.description;
    let language = req.params.language || "en";
    if (!title) {
      return res.status(400).json({
        message: "Cannot create Organization without at least a title"
      });
    }
    const user_id = req.user.user_id;
    const thing = await db.one(CREATE_ORGANIZATION, {
      title,
      body,
      description,
      language
    });
    req.thingid = thing.thingid;
    return getEditXById("organization")(req, res);
  } catch (error) {
    log.error("Exception in POST /organization/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
  // Refresh search index
  try {
    db.none("REFRESH MATERIALIZED VIEW CONCURRENTLY search_index_en;");
  } catch (error) {
    log.error("Exception in POST /organization/new => %s", error);
  }
}

/**
 * @api {put} /organization/:id  Submit a new version of a organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName editOrganization
 * @apiParam {Number} id Organization ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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

const postOrganizationUpdateHttp = getEditXById("organization");

async function getOrganizationHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "organization");
  const articleRow = await db.one(ORGANIZATION_VIEW_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticText = {};
  returnByType(res, params, article, staticText);
}

async function getOrganizationEditHttp(req, res) {
  const params = parseGetParams(req, "organization");
  const articleRow = await db.one(ORGANIZATION_EDIT_BY_ID, params);
  const article = articleRow.results;
  fixUpURLs(article);
  const staticText = {};
  returnByType(res, params, article, staticText);
}

async function getOrganizationNewHttp(req, res) {
  const params = parseGetParams(req, "organization");
  params.view = "edit";
  const article = ORGANIZATION_STRUCTURE;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.post("/new", postOrganizationNewHttp);
router.post("/:thingid", postOrganizationUpdateHttp);
router.get("/:thingid/", getOrganizationHttp);
router.get("/:thingid/edit", getOrganizationEditHttp);
router.get("/new", getOrganizationNewHttp);

module.exports = {
  organization: router,
  postOrganizationNewHttp,
  postOrganizationUpdateHttp,
  getOrganizationHttp,
  getOrganizationEditHttp,
  getOrganizationNewHttp
};
