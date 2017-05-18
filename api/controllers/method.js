"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let log = require("winston");
let jwt = require("express-jwt");

let { db, sql, as, helpers } = require("../helpers/db");
let { getXByIdFns } = require("../helpers/things");

const empty_method = {
  title: "",
  body: "",
  language: "en",
  user_id: null,
  original_language: "en",
  best_for: null,
  communication_mode: null,
  decision_method: null,
  facilitated: null,
  governance_contribution: null,
  issue_interdependency: null,
  issue_polarization: null,
  issue_technical_complexity: null,
  kind_of_influence: null,
  method_of_interaction: null,
  public_interaction_method: null,
  post_date: "now",
  published: true,
  typical_funding_source: null,
  typical_implementing_entity: null,
  typical_sponsoring_entity: null,
  updated_date: "now",
  lead_image_url: "",
  other_images: "{}",
  files: "{}",
  videos: "{}",
  tags: "{}",
  featured: false
};

const {
  getMethodById_lang_userId,
  getMethodByRequest,
  returnMethodById
} = getXByIdFns("method");

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
router.post("/new", async function(req, res) {
  // create new `method` in db
  // req.body *should* contain:
  //   title
  //   body (or "summary"?)
  //   photo
  //   video
  //   location
  //   related methods
  try {
    let title = req.body.title;
    let body = req.body.body || req.body.summary;
    let language = req.params.language || "en";
    if (!(title && body)) {
      return res.status(400).json({
        message: "Cannot create Method, both title and body are required"
      });
    }
    const user_id = req.user.user_id;
    const videos = as.videos(req.body.vidURL);
    const lead_image = as.attachment(req.body.lead_image); // frontend isn't sending this yet
    const method_id = await db.one(
      sql("../sql/create_method.sql"),
      Object.assign({}, empty_method, {
        title,
        body,
        lead_image,
        videos,
        user_id
      })
    );
    // save related objects (needs case_id)
    const relCases = as.related_list(
      "method",
      method_id.method_id,
      "case",
      req.body.related_cases
    );
    if (relCases) {
      await db.none(relCases);
    }
    const relMethods = as.related_list(
      "method",
      method_id.method_id,
      "method",
      req.body.related_methods
    );
    if (relMethods) {
      await db.none(relMethods);
    }
    const relOrgs = as.related_list(
      "method",
      method_id.method_id,
      "organization",
      req.body.related_organizations
    );
    if (relOrgs) {
      await db.none(relOrgs);
    }
    const newMethod = await getMethodById_lang_userId(
      method_id.method_id,
      language,
      user_id
    );
    return res
      .status(201)
      .json({ OK: true, data: method_id, object: newMethod });
  } catch (error) {
    log.error("Exception in POST /method/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
});

/**
 * @api {put} /method/:id  Submit a new version of a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName editMethodById
 * @apiParam {Number} methodId Method ID
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

router.put("/:id", function editMethodById(req, res) {
  // let methodId = req.swagger.params.id.value;
  // let methodBody = req.body;
  res.status(200).json(req.body);
});

/**
 * @api {get} /method/:id Get the last version of a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName getMethodById
 * @apiParam {Number} id Method ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} method data
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
 *
 */

router.get(
  "/:methodId",
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"]
  }),
  returnMethodById
);

/**
 * @api {delete} /method/:id Delete a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName deleteMethod
 * @apiParam {Number} id Method ID
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

router.delete("/:id", function deleteMethod(req, res) {
  // let id = req.swagger.params.id.value;
  res.status(200).json(req.body);
});

module.exports = router;
