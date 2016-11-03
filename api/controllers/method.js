'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var es = require('../helpers/es')
var ddb = require('../helpers/ddb')
var getAuthorByAuthorID = require('../helpers/getAuthor')
var AWS = require("aws-sdk");

AWS.config.update({
  profile: "ppadmin",
  region: "us-east-1"
});


var Bodybuilder = require('bodybuilder')
var jsonStringify = require('json-pretty');


/**
 * @api {post} /method/new Create new method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName newMethod
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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
router.post('/new', function (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    console.log('user is in curators group')
    // figure out what ElasticSearch query this corresponds to
    // sign with with AWS4 module
    es.index({
      index: 'pp',
      type: 'method',
      body: req.body
    }, function (error, response) {
      if (error) {
        res.status(error.status).json({message: error.message})
      } else {
        // console.log(response)
        res.status(200).json(req.body)
      }
    })
  })
})

/**
 * @api {put} /method/:orgId  Submit a new version of a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName editMethod
 * @apiParam {Number} methodId Method ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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

router.put('/:id', function editCaseById (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var orgId = req.swagger.params.id.value
    var caseBody = req.body
    res.status(200).json(req.body)
  })})

/**
 * @api {get} /method/:id Get the last version of a method
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName getMethodById
 * @apiParam {Number} id Method ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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

router.get('/:id', function editMethodById (req, res) {
  // Get the case for dynamodb
  // get the author from dynamodb
  
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : "pp_methods",
      Limit : 1,
      ScanIndexForward: false, // this will return the last row with this id
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
          ":id":req.params.id
      }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err)
    } else {
      console.log("Query succeeded.");
      let method = data.Items[0];
      if (method) {
        getAuthorByAuthorID(method.author_uid, function(err, author) {
          console.log("author", author, err)
          if (author) {
            method.author = author.Items[0];
            res.status(200).json({
              OK: true,
              data: data.Items
            })
          } else {
            res.status(500).json({"error": "No author record found for id="+method.author_uid});
          }
        })
      } else {
        res.status(500).json({"error": "No method found for id =" + req.params.id});
      }
    }
  });
})

/**
 * @api {delete} /method/:id Delete a case
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

router.delete('/:id', function editCaseById (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var id = req.swagger.params.id.value
    res.status(200).json(req.body)
  })
})

module.exports = router
