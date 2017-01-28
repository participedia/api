'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var url = require('url')
var jwt = require('../helpers/jwt')()
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var parse = require('pg-connection-string').parse;
var config = parse(connectionString)
config['ssl'] = true
var db = pgp(config);

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
router.get('/', function (req, res, next) {
  console.log("in /user/")
  // XXX figure out about pagination -- for now, return everything.
  db.any('select * from users')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL users'
        });
    })
    .catch(function (err) {
      return next(err);
    });
})

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

router.get('/get/:userId', function edituserById (req, res, next) {
  var userId = parseInt(req.params.userId);
  db.one('select * from users where id = $1', userId)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
})


router.post('/update', function updateUser (req, res, next) {
  console.log(req.body.user);
  if (req.body.secretToken != process.env.SECRET_TOKEN) {
    res.status(401)
      .json({
        status: 'unauthorized',
        message: "Call didn't pass in right secret token"
      });
  } else {
    // See if the user exists.
    var userId = req.body.user.user_id
    var name = req.body.user.name
    db.one('select * from users where id = $1', userId)
      .then(function (data) {
        // If user exists, do an update
        db.none('update users set name=$1 where id=$4',
          [name, userId])
          .then(function () {
            res.status(200)
              .json({
                status: 'success',
                message: 'Updated user'
              });
          })
          .catch(function (err) {
            return next(err);
          });
      })
      .catch(function (err) {
        db.none('insert into users(name)' +
            'values(${name})',
          req.body)
          .then(function () {
            res.status(200)
              .json({
                status: 'success',
                message: 'Inserted user'
              });
          })
          .catch(function (err) {
            return next(err);
          });
      });
  }
})

  // var userId = parseInt(req.params.userId);

router.put('/update/:userId', function updateUserById (req, res, next) {
  var userId = parseInt(req.params.userId);
  // See if the user exists.
  db.one('select * from users where id = $1', userId)
    .then(function (data) {
      // If user exists, do an update
      db.none('update users set name=$1, age=$2, sex=$3 where id=$4',
        [req.body.name, parseInt(req.body.age), req.body.sex, userId])
        .then(function () {
          res.status(200)
            .json({
              status: 'success',
              message: 'Updated user'
            });
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      db.none('insert into users(name, age, sex)' +
          'values(${name}, ${age}, ${sex})',
        req.body)
        .then(function () {
          res.status(200)
            .json({
              status: 'success',
              message: 'Inserted user'
            });
        })
        .catch(function (err) {
          return next(err);
        });
    });
})


module.exports = router
