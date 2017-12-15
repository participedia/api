"use strict";

const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");

const { db, sql, as } = require("../helpers/db");
const { returnTemplate } = require("../helpers/template");

const CREATE_ORGANIZATION = sql("../sql/create_organization.sql");

const {
  getEditXById,
  addRelatedList,
  returnThingByRequest,
  getThingByType_id_lang_userId,
} = require("../helpers/things");


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
router.post("/new", async function(req, res) {
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
    await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
  } catch (error) {
    log.error("Exception in POST /organization/new => %s", error);
  }
});

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

router.put("/:thingid", getEditXById("organization"));

/**
 * @api {get} /organization/template Get the template for organizations
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName returnOrganizationTemplate
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data organization template
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "id": "int",
 *         "type": "string",
 *         "original_language": "string",
 *           ...
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.get("/template", (req, res) => returnTemplate("organization", req, res));

/**
 * @api {get} /organization/:thingid?filter=:filter Get the last version of a organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName returnOrganizationById
 * @apiParam {Number} thingid Organization ID, can be 'all'.
 * @apiParam {Object} filter URL-encoded JSON object of fields that should not
 *      be returned with the data. Key of field name, value of false
 *      eg A value of %7B%22title%22%3Afalse%7D ({"title":false}) specifies
 *      that the title field should not be included.
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data organization data
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

router.get("/:thingid", (req, res, next) => returnThingByRequest("organization", req, res, next));

/**
 * @api {delete} /organization/:id Delete an organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName deleteOrganization
 * @apiParam {Number} Organization ID
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

router.delete("/:id", function deleteOrganization(req, res) {
  // let orgId = req.swagger.params.id.value;
  res.status(200).json(req.body);
});

module.exports = router;
