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

async function lookupBookmarksById(req, res, userId) {
  try {
    const data = await db.any("SELECT * FROM bookmarks WHERE userid=$1", [
      as.number(userId)
    ]);
    res.json({
      success: true,
      status: "success",
      data: data,
      message: "Retrieved ALL bookmarks for specified user"
    });
  } catch (error) {
    log.error(error);
    res.json({ success: false, error: error.message || error });
  }
}

async function queryBookmarks(req, res) {
  try {
    let userid = as.number(req.params.userid);

    if (!userid) {
      await ensureUser(req, res);
      userid = req.user.user_id; // put there by ensureUser
    }
    lookupBookmarksById(req, res, userid);
  } catch (error) {
    log.error(error);
    res.json({ success: false, error: error.message || error });
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

router.post("/add", async function addBookmark(req, res) {
  try {
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
    let bookmarkType = req.body.bookmarkType;
    const data = await db.one(
      "insert into bookmarks(bookmarktype, thingid, userid) VALUES(${bookmarkType},${thingId},${userId}) returning id",
      { bookmarkType, thingId, userId }
    );
    res.json({
      success: true,
      status: "success",
      data: data.id,
      message: "Inserted bookmark, returning ID"
    });
  } catch (error) {
    log.error("Exception in INSERT", error);
    res.json({
      success: false,
      error: error.message || error
    });
  }
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

router.delete("/delete", async function updateUser(req, res) {
  try {
    const userId = as.number(req.user.user_id);
    const bookmarkType = as.number(req.body.bookmarkType);
    const thingId = as.text(req.body.thingID);
    let data = await db.one(
      "select * from bookmarks where bookmarktype = ${bookmarkType} AND thingid = ${thingId} AND userid = ${userId}",
      { bookmarkType, thingId, userId }
    );
    if (data.userid != userId) {
      res.status(401).json({
        message: "access denied - user is not the owner of the bookmark"
      });
    } else {
      data = await db.none("delete from bookmarks where id = $1", data.id);
      res
        .status(200)
        .json({ status: "success", message: `Removed a bookmark` });
    }
  } catch (error) {
    log.error("Error deleting bookmark", error);
    res.json({
      success: false,
      error: error.message || error
    });
  }
});

module.exports = router;
