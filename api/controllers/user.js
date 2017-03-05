"use strict";
let express = require("express");
/* eslint-disable new-cap */
let router = express.Router();
/* eslint-enable new-cap */
let db = require("../helpers/db");

/**
 * @api {get} /users List users 
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName listusers
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
 *     id: 1,
 *     name: "Tyler",
 *     age: 3,
 *     sex: "M"
 *   }
 * ],
 *   message: "Retrieved ALL users"
 * }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
router.get("/", function(req, res, next) {
  // TODO figure out about pagination -- for now, return everything.
  db
    .any("select * from users")
    .then(function(data) {
      res.status(200).json({
        status: "success",
        data: data,
        message: "Retrieved ALL users"
      });
    })
    .catch(function(err) {
      return next(err);
    });
});

/**
 * @api {get} /user/get/:userId Get info about a user
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName getuserById
 * @apiParam {string} userId user ID
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
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.get("/get/:userId", function edituserById(req, res, next) {
  let userId = parseInt(req.params.userId);
  db
    .one("select * from users where id = $1", userId)
    .then(function(data) {
      res.status(200).json({
        status: "success",
        data: data,
        message: "Retrieved ONE user"
      });
    })
    .catch(function(err) {
      return next(err);
    });
});

/**
 * @api {post} /user/update Update user table from auth0
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName updateUser
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
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.post("/update", function updateUser(req, res, next) {
  console.log(req.body.user);
  if (req.body.secretToken != process.env.SECRET_TOKEN) {
    res.status(401).json({
      status: "unauthorized",
      message: "Call didn't pass in right secret token"
    });
  } else {
    // See if the user exists.
    let userId = req.body.user.user_id;
    let name = req.body.user.name;
    db
      .one("select * from users where id = $1", userId)
      .then(function(data) {
        // If user exists, do an update
        db
          .none("update users set name=$1 where id=$4", [name, userId])
          .then(function() {
            res.status(200).json({
              status: "success",
              message: "Updated user"
            });
          })
          .catch(function(err) {
            return next(err);
          });
      })
      .catch(function(err) {
        db
          .none("insert into users(name)" + "values(${name})", req.body.user)
          .then(function() {
            res.status(200).json({
              status: "success",
              message: "Inserted user"
            });
          })
          .catch(function(err) {
            return next(err);
          });
      });
  }
});

module.exports = router;
