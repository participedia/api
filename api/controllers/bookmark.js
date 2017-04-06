"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let groups = require("../helpers/groups");
let { db, as } = require("../helpers/db");
let { userByEmail, ensureUser } = require("../helpers/user");
let log = require("winston");

/**
 * @api {get} /bookmark/list/:userId List bookmarks for a given user
 * @apiGroup bookmarks
 * @apiVersion 0.1.0
 * @apiName getbookmarksforuser
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data user data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *   status: "success",
 *   data: [
 *   {
 *   }
 * ],
 *   message: "Retrieved ALL bookmarks for a user"
 * }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

function lookupBookmarksById(req, res, userId, next) {
  db
    .any("SELECT * FROM bookmarks WHERE userid=$1", [as.number(userId)])
    .then(data => {
      res.json({
        success: true,
        status: "success",
        data: data,
        message: "Retrieved ALL bookmarks for specified user"
      });
    })
    .catch(function(error) {
      res.json({
        success: false,
        error: error.message || error
      });
      log.error(error);
    });
}

function queryBookmarks(req, res, next) {
  let userid = req.params.userid;

  if (!userid) {
    ensureUser(req, res, function(req, res, next) {
      userid = req.user.user_id; // put there by ensureUser
      lookupBookmarksById(req, res, userid, next);
    });
  } else {
    lookupBookmarksById(req, res, userid, next);
  }
}

router.get("/list", queryBookmarks);
router.get("/list/:userid", queryBookmarks);

/**
 * @api {post} /bookmark/add Create a bookmark
 * @apiGroup bookmarks
 * @apiVersion 0.1.0
 * @apiName addBookmark
 * @apiParam {String[]} bookmarkType Bookmark type (case,method, etc.)
 * @apiParam {Number} thingID ID of the thing (case ID, etc.)
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data user data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.post("/add", function addBookmark(req, res, next) {
  if (!req.body.bookmarkType) {
    log.error("Required parameter (bookmarkType) wasn't specified");
    res.status(400).json({
      message: "Required parameter (bookmarkType) wasn't specified"
    });
    return;
  }
  if (!req.body.thingID) {
    log.error("Required parameter (thingID) wasn't specified");
    res
      .status(400)
      .json({ error: "Required parameter (thingID) wasn't specified" });
    return;
  }
  if (!req.user.user_id) {
    log.error("No user");
    res.status(400).json({ error: "User (userId) wasn't specified" });
    return;
  }
  let userId = as.number(req.user.user_id);
  let thingId = as.number(req.body.thingID);
  let bookmarkType = as.text(req.body.bookmarkType);
  db
    .one(
      "insert into bookmarks(bookmarktype, thingid, userid) VALUES(${bookmarkType},${thingId},${userId}) returning id",
      { bookmarkType, thingId, userId }
    )
    .then(function(data) {
      res.json({
        success: true,
        status: "success",
        data: data.id,
        message: "Inserted bookmark, returning ID"
      });
    })
    .catch(function(err) {
      res.json({
        success: false,
        error: error.message || error
      });
      log.error("Exception in INSERT", err);
      return next(err);
    });
});

/**
 * @api {delete} /bookmark Delete specified bookmark
 * @apiGroup bookmarks
 * @apiVersion 0.1.0
 * @apiName updateUser
 * @apiParam {String[]} bookmarkType Bookmark type (case,method, etc.)
 * @apiParam {Number} thingID ID of the thing (case ID, etc.)
 *
 * @apiSuccess {Boolean} OK true if call was successful
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

router.delete("/delete", function updateUser(req, res, next) {
  let userId = as.number(req.user.user_id);
  let bookmarkType = as.number(req.body.bookmarkType);
  let thingId = as.text(req.body.thingID);
  db
    .one(
      "select * from bookmarks where bookmarktype = ${bookmarkType} AND thingid = ${thingId} AND userid = ${userId}",
      { bookmarkType, thingId, userId }
    )
    .then(function(data) {
      if (data.userid != userId) {
        res.status(401).json({
          message: "access denied - user is not the owner of the bookmark"
        });
      } else {
        db
          .none("delete from bookmarks where id = $1", data.id)
          .then(function(data) {
            res.status(200).json({
              status: "success",
              message: `Removed a bookmark`
            });
          })
          .catch(function(err) {
            log.error("error delete a bookmark", err);
            res.json({
              success: false,
              error: err.message || err
            });
          });
      }
    })
    .catch(function(err) {
      log.error("error looking for bookmark to delete", err);
      res.json({
        success: false,
        error: err.message || err
      });
    });
});

module.exports = router;
