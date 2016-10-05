'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var es = require('../helpers/es')
var ddb = require('../helpers/ddb')

var AWS = require("aws-sdk");

AWS.config.update({
  profile: "ppadmin",
  region: "us-east-1"
});


var Bodybuilder = require('bodybuilder')
var jsonStringify = require('json-pretty');


/**
 * @api {get} /organization/search Search through the cases
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName search
 *
 * @apiParam  {String} query query term
 * @apiParam  {String} sortingMethod ('chronological' or 'alphabetical' or 'featured')
 * @apiParam  {String} selectedCategory ('All' or 'Case' or 'Method' or 'Organization' or 'News')
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data Mapping of country names to counts (when `OK` is true)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *          ... (ElasticSearch records) ...
 *       }
 *     }
 *
 */

router.get('/search', function (req, res) {
  let body = new Bodybuilder()
  let query = req.query.query
  let sortingMethod = req.query.sortingMethod
  let selectedCategory = req.query.selectedCategory
  if (! sortingMethod) {
    sortingMethod = 'chronological'
  }
  if (! selectedCategory) {
    selectedCategory = 'all'
  }
  console.log("query", query, "sortingMethod", sortingMethod, "selectedCategory", selectedCategory)

  if (query) {
    body = body.query('match', "_all", query)
  }
  if (sortingMethod === 'chronological') {
    body = body.sort('lastmodified', 'desc')
  } else {
    body = body.sort('id', 'asc') // Note this requires a non-analyzed field
  }
  let bodyquery = body.size(30).build('v2')
  console.log(JSON.stringify(bodyquery, null, 2))

  if (query) {
    console.log("FIRST BIT");
    es.search({
      index: 'pp',
      body: bodyquery
    }).then(function success(ret) {
      console.log("ret", ret);
      res.json(ret)
    }, function failure (error) {
      console.log("error", error);
      res.status(500).json(error);
    })
  } else {
    es.search({
      index: 'pp',
      match_all: {},
      // body: bodyquery
    }).then(function success (ret) {
      console.log("ret", JSON.stringify(ret, null, 2));
      res.json({OK: true, data: ret})
    }, function failure (error) {
      console.log("error", error);
      res.status(500).json(error)
    })
  }
})

/**
 * @api {post} /organization/new Create new case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName newCase
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
      type: 'case',
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
 * @api {put} /organization/:orgId  Submit a new version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName editCase
 * @apiParam {Number} orgId Case ID
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

router.put('/:orgId', function editCaseById (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var orgId = req.swagger.params.orgId.value
    var caseBody = req.body
    console.log('orgId', orgId, 'case', caseBody)
    res.status(200).json(req.body)
  })})

/**
 * @api {get} /organization/:orgId Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName getCaseById
 * @apiParam {Number} orgId Case ID
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

// TODO: refactor this in a common helper

function getLastThingByID(tableName, id, cb) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : tableName,
      Limit : 1,
      ScanIndexForward: false, // this will return the last row with this id
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
          ":id": String(id)
      }
  };

  console.log("params", params);
  docClient.query(params, cb)
}

function getAuthorByAuthorID(authorID, cb) {
  getLastThingByID('pp_users', authorID, cb);
}

router.get('/:orgId', function editOrgById (req, res) {
  // Get the case for dynamodb
  // get the author from dynamodb
  
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : "pp_organizations",
      Limit : 1,
      ScanIndexForward: false, // this will return the last row with this id
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
          ":id":req.params.orgId
      }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err)
    } else {
      console.log("Query succeeded.");
      let thecase = data.Items[0];
      if (thecase) {
        getAuthorByAuthorID(thecase.author_uid, function(err, author) {
          console.log("author", author, err)
          if (author) {
            thecase.author = author.Items[0];
            res.status(200).json({
              OK: true,
              data: data.Items
            })
          } else {
            res.status(500).json({"error": "No author record found for id="+thecase.author_uid});
          }
        })
      } else {
        res.status(500).json({"error": "No organization found for id =" + req.params.orgId});
      }
    }
  });
})

/**
 * @api {delete} /organization/:orgId Delete a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName deleteCase
 * @apiParam {Number} orgId Case ID
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

router.delete('/:orgId', function editCaseById (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var orgId = req.swagger.params.orgId.value
    var caseBody = req.body
    console.log('orgId', orgId, 'organization', caseBody)
    res.status(200).json(req.body)
  })
})

module.exports = router
