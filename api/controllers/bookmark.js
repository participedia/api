"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let groups = require("../helpers/groups");
let { db, as } = require("../helpers/db");
let { userByEmail } = require("../helpers/user");
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
      userid = req.user.id; // put there by preferUser
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
 * @apiParam {Number} thingid ID of the thing (case ID, etc.)
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
    if (!req.body.thingid) {
      log.error("Required parameter (thingid) wasn't specified");
      res
        .status(400)
        .json({ error: "Required parameter (thingid) wasn't specified" });
      return;
    }
    if (!req.user.id) {
      log.error("No user");
      res.status(401).json({ error: "You must be logged in to perform this action." });
      return;
    }
    let userId = as.number(req.user.id);
    let thingid = as.number(req.body.thingid);
    let bookmarkType = req.body.bookmarkType;
    const data1 = await db.oneOrNone(
      "select * from bookmarks where bookmarktype = ${bookmarkType} AND thingid = ${thingid} AND userid = ${userId}",
      { bookmarkType, thingid, userId }
    );
    if (data1) {
      return res.status(304).json({
        success: true,
        status: "success",
        data: data1.id,
        message: "bookmark already exists, no action"
      });
    }
    const data2 = await db.one(
      "insert into bookmarks(bookmarktype, thingid, userid) VALUES(${bookmarkType},${thingid},${userId}) returning id",
      { bookmarkType, thingid, userId }
    );
    res.status(200).json({
      success: true,
      status: "success",
      data: data2.id,
      message: "Inserted bookmark, returning ID"
    });
  } catch (error) {
    log.error("Exception in INSERT", error);
    res.status(500).json({
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
 * @apiParam {Number} thingid ID of the thing (case ID, etc.)
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
    const userId = as.number(req.user.id);
    const bookmarkType = req.body.bookmarkType;
    const thingid = as.number(req.body.thingid);
    const data1 = await db.one(
      "select * from bookmarks where bookmarktype = ${bookmarkType} AND thingid = ${thingid} AND userid = ${userId}",
      { bookmarkType, thingid, userId }
    );
    const data2 = await db.none(
      "delete from bookmarks where id = $1",
      data1.id
    );
    res.status(200).json({ status: "success", message: `Removed a bookmark` });
  } catch (error) {
    log.error("Error deleting bookmark", error);
    res.json({
      success: false,
      error: error.message || error
    });
  }
});

module.exports = router;
