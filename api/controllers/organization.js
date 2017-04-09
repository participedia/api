"use strict";

let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let log = require("winston");

let { getUserIfExists } = require("../helpers/user");
let { db, sql, as } = require("../helpers/db");

const empty_organization = {
  title: "",
  body: "",
  language: "en",
  user_id: null,
  original_language: "en",
  executive_director: null,
  post_date: "now",
  published: true,
  sector: null,
  updated_date: "now",
  location: null,
  lead_image_url: "",
  other_images: "{}",
  files: "{}",
  videos: "{}",
  tags: "{}",
  featured: false
};

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
    let title = req.body.title;
    let body = req.body.summary;
    if (!(title && body)) {
      return res.status(400).json({
        message: "Cannot create Organization, both title and summary are required"
      });
    }
    const user_id = req.user.user_id;
    const location = as.location(req.body.location);
    const videos = as.videos(req.body.vidURL);
    const lead_image = as.attachment(req.body.lead_image); // frontend isn't sending this yet
    const related_cases = as.related_list(req.body.related_cases);
    const related_methods = as.related_list(req.body.related_methods);
    const related_organizations = as.related_list(
      req.body.related_organizations
    );
    const organization_id = await db.one(
      sql("../sql/create_organization.sql"),
      Object.assign({}, empty_organization, {
        title,
        body,
        location,
        lead_image,
        videos,
        related_cases,
        related_methods,
        related_organizations,
        user_id
      })
    );
    return res.status(201).json({
      OK: true,
      data: organization_id
    });
  } catch (error) {
    log.error("Exception in POST /organization/new => %s", error);
    return res.status(500).json({
      OK: false,
      error: error
    });
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

router.put("/:id", function editOrgById(req, res) {
  // let orgId = req.swagger.params.id.value;
  res.status(200).json(req.body);
});

/**
 * @api {get} /organization/:id Get the last version of an organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName getOrgById
 * @apiParam {Number} id Organization ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} Organization data
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

router.get("/:organizationId", async function getorganizationById(req, res) {
  try {
    const organizationId = as.number(req.params.organizationId);
    const organization = await db.one(sql("../sql/organization_by_id.sql"), {
      organizationId: organizationId,
      lang: req.params.language || "en"
    });
    const userId = await getUserIfExists(req);
    organization.bookmarked = await db.one(sql("../sql/bookmarked.sql"), {
      type: "organization",
      thingId: organizationId,
      userId: userId
    });
    res.status(200).json({
      OK: true,
      data: organization
    });
  } catch (error) {
    log.error("Exception in GET /organization/%s => %s", organizationId, error);
    res.status(500).json({ OK: false, error: error });
  }
});

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
