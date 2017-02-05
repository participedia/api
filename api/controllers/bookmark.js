'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var url = require('url')
var jwt = require('../helpers/jwt')()
var db = require('../helpers/db')
var log = require('winston')

/**
 * @api {get} /bookmark/:userId List bookmarks for a given user 
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
router.get('/list/:userId', function (req, res, next) {
  // Find out if userID exists in user table
  try {
    var userId = req.params.userId;
    db.any('SELECT * FROM bookmarks WHERE userid=$1', [userId])
      .then(data => {
        res.json({
          success: true,
          status: 'success',
          data: data,
          message: 'Retrieved ALL users'
        });
      })
      .catch(function (err) {
        res.json({
          success: false, 
          error: error.message || error
        })
        log.error(err)
      });
  } catch(err) {
    console.log(err);
    log.error(err)
    return next(err);
  };
})

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

router.post('/add', function addBookmark (req, res, next) {
  try {
    groups.user_has(req, 'Contributors', function () {
      res.status(401).json({message: 'access denied - user does not have proper authorization'})
    }, function () {
      if (! req.body.bookmarkType) {
        log.error("Required parameter (bookmarkType) wasn't specified")
        res.status(400).json({message:"Required parameter (bookmarkType) wasn't specified"})
        return
      }
      if (! req.body.thingID) {
        log.error("Required parameter (thingID) wasn't specified")
        res.status(400).json({error: "Required parameter (thingID) wasn't specified"})
        return
      }
      var userId = req.user.user_id;
      if (! userId) {
        log.error("No user")
        res.status(400).json({error: "User (userId) wasn't specified"})
        return
      }
      db.one('insert into bookmarks(bookmarktype, thingid, userid) VALUES($1,$2,$3) returning id',
          [req.body.bookmarkType, req.body.thingID, userId])
        .then(function (data) {
          res.json({
            success: true,
            status: 'success',
            message: 'Inserted bookmark, returning ID'
          });
        })
        .catch(function (err) {
          res.json({
            success: false, 
            error: error.message || error
          })
          log.error("Exception in INSERT", err)
          return next(err);
        });
    })
  } catch (e) {
    log.error(e)
    return next(err)
  }
})


/**
 * @api {delete} /bookmark/:bookmarkID Delete specified bookmark
 * @apiGroup bookmarks
 * @apiVersion 0.1.0
 * @apiName updateUser
 * @apiParam {Number} bookmarkID bookmark ID
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

router.delete('/delete/:bookmarkID', function updateUser (req, res, next) {
  groups.user_has(req, 'Contributors', function () {
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var userId = req.user.user_id;
    var bookmarkID = parseInt(req.params.bookmarkID)
    db.one('select * from bookmarks where ID = $1', bookmarkID)
      .then(function(data) {
        if (data.user != userId) {
          res.status(401).json({message: 'access denied - user is not the owner of the bookmark'})
        } else {
          db.none('delete from bookmarks where id = $1', bookmarkID)
            .then(function (data) {
              res.status(200)
                .json({
                  status: 'success',
                  message: `Removed a bookmark`
                });
            })
            .catch(function (err) {
              return next(err);
            });
        }
      })
      .catch(function (err) {
        return next(err);
      });
  })
})

module.exports = router
