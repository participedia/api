"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");

const { db, sql, as } = require("../helpers/db");
const {
  getEditXById,
  addRelatedList,
  returnThingByRequest,
  getThingByType_id_lang_userId
} = require("../helpers/things");

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
    cache.clear();

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
    const tags = as.strings(req.body.tags);
    const links = as.strings(req.body.links);
    const thing = await db.one(sql("../sql/create_method.sql"), {
      title,
      body,
      language,
      lead_image,
      videos,
      tags,
      links,
      user_id
    });
    const thingid = thing.thingid;
    // save related objects (needs thingid)
    const relCases = addRelatedList(
      "method",
      thingid,
      "case",
      req.body.related_cases
    );
    if (relCases) {
      await db.any(relCases);
    }
    const relMethods = addRelatedList(
      "method",
      thingid,
      "method",
      req.body.related_methods
    );
    if (relMethods) {
      await db.any(relMethods);
    }
    const relOrgs = addRelatedList(
      "method",
      thingid,
      "organization",
      req.body.related_organizations
    );
    if (relOrgs) {
      await db.any(relOrgs);
    }
    const newMethod = await getThingByType_id_lang_userId(
      "method",
      thingid,
      language,
      user_id
    );
    // Refresh search index
    await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
    return res.status(201).json({ OK: true, data: thing, object: newMethod });
  } catch (error) {
    log.error("Exception in POST /method/new => %s", error);
    console.trace(error);
    return res.status(500).json({ OK: false, error: error });
  }
});

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

router.put("/:thingid", getEditXById("method"));

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

router.get("/:thingid", (req, res) => returnThingByRequest("method", req, res));

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
