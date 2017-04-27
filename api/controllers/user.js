"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let log = require("winston");
let { db, sql } = require("../helpers/db");
let { ensureUser } = require("../helpers/user");

async function getUserById(req, userId, res) {
  try {
    const result = await db.oneOrNone(sql("../sql/user_by_id.sql"), {
      userId: userId,
      language: req.params.language || "en"
    });
    res.status(200).json({ OK: true, data: result.user });
  } catch (error) {
    log.error("Exception in GET /user/%s => %s", req.params.userId, error);
    if (error.message && error.message == "No data returned from the query.") {
      res.status(404).json({ OK: false });
    } else {
      res.status(500).json({ OK: false, error: error });
    }
  }
}

/**
 * @api {get} /user/:userId Retrieve a user
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName getUserById
 * @apiParam {Number} userId user ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {data} User object if call was successful
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
router.get("/:userId", function(req, res) {
  return getUserById(req, req.params.userId, res);
});

router.get("/", async function(req, res) {
  await ensureUser(req, res);
  return getUserById(req, req.user.user_id, res);
});

/**
 * @api {delete} /user/:userId Delete a user
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName deleteuser
 * @apiParam {Number} userId user ID
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

router.delete("/:userId", function edituserById(req, res) {
  cache.clear();
  // let userId = req.swagger.params.userId.value;
  // let userBody = req.body;
  res.status(200).json(req.body);
});

module.exports = router;
