'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var es = require('../helpers/es')
var ddb = require('../helpers/ddb')
var cache = require('apicache')
var AWS = require("aws-sdk")
var getAuthorByAuthorID = require('../helpers/getAuthor')
var log = require('winston')

AWS.config.update({
  profile: "ppadmin",
  region: "us-east-1"
});


var Bodybuilder = require('bodybuilder')
var jsonStringify = require('json-pretty');


/**
 * @api {get} /case/countsByCountry Get case counts for each country
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName countsByCountry
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
 *          countryCounts: {
 *            "United States": 122,
 *            "United Kingdom": 57,
 *            "Italy": 51,
 *            ...
 *        }
 *     }
 *
 */

// TODO: figure out if the choropleth should show cases or all things

router.get('/countsByCountry', function (req, res) {
  let body = new Bodybuilder()
  let bodyquery = body.aggregation('terms', 'geo_country', null, {size: 0}).size(0).build()
  es.search({
    index: 'pp',
    type: 'case',
    body: bodyquery
  }).then(function (resp) {
    var countryCounts = {}
    let buckets = resp.aggregations.agg_terms_geo_country.buckets
    for (let i in buckets) {
      countryCounts[buckets[i].key] = buckets[i].doc_count
    }
    res.status(200).json({
      OK: true,
      data: {
        countryCounts: countryCounts
      }
    })
  }, function (resp) {
    res.status(500).json('uh-oh')
  })
})

/**
 * @api {post} /case/new Create new case
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
router.post('/new', function (req, res, next) {
  groups.user_has(req, 'Contributors', function () {
    log.debug("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
  }, function () {
    // figure out what ElasticSearch query this corresponds to		+    // XXX do SQL insertion
    // sign with with AWS4 module		+    res.status(200).json(req.body)
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
 * @api {put} /case/:caseId  Submit a new version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName editCase
 * @apiParam {Number} caseId Case ID
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

router.put('/:caseId', function editCaseById (req, res) {
  cache.clear()
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var caseId = req.swagger.params.caseId.value
    var caseBody = req.body
    console.log('caseId', caseId, 'case', caseBody)
    res.status(200).json(req.body)
  })})

/**
 * @api {get} /case/:caseId Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName getCaseById
 * @apiParam {Number} caseId Case ID
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

router.get('/:caseId', function editCaseById (req, res) {
  // Get the case for dynamodb
  // get the author from dynamodb
  
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : "pp_cases",
      Limit : 1,
      ScanIndexForward: false, // this will return the last row with this id
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
          ":id":req.params.caseId
      }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err)
    } else {
      let thecase = data.Items[0];
      if (thecase) {
        getAuthorByAuthorID(thecase.author_uid, function(err, author) {
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
        res.status(500).json({"error": "No case found for id =" + req.params.caseId});
      }
    }
  });
})

/**
 * @api {delete} /case/:caseId Delete a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName deleteCase
 * @apiParam {Number} caseId Case ID
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

router.delete('/:caseId', function editCaseById (req, res) {
  cache.clear()
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var caseId = req.swagger.params.caseId.value
    var caseBody = req.body
    console.log('caseId', caseId, 'case', caseBody)
    res.status(200).json(req.body)
  })
})

module.exports = router
