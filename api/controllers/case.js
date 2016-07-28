'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var es = require('../helpers/es')
var Bodybuilder = require('bodybuilder')

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

router.get('/countsByCountry', function (req, res) {
  let body = new Bodybuilder()
  let bodyquery = body.aggregation('terms', 'Country', null, {size: 0}).size(0).build()
  es.search({
    index: 'pp',
    type: 'case',
    body: bodyquery
  }).then(function (resp) {
    var countryCounts = {}
    let buckets = resp.aggregations.agg_terms_Country.buckets
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
 * @api {get} /case/search Search through the cases
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
  let query = req.params.query
  let sortingMethod = req.params.sortingMethod
  let selectedCategory = req.params.selectedCategory

  if (query) {
    body = body.query('match', '_all', query)
  }
  if (sortingMethod === 'chronological') {
    body = body.sort('LastUpdatedDate', 'desc')
  } else {
    body = body.sort('CaseID.raw', 'asc') // Note this requires a non-analyzed field
  }
  let bodyquery = body.size(30).build('v2')

  if (query) {
    let ret = es.search({
      index: 'pp',
      body: bodyquery
    })
    res.json(ret)
  } else {
    es.search({
      index: 'pp',
      match_all: {},
      body: bodyquery
    }).then(function success (ret) {
      res.json({OK: true, data: ret})
    }, function failure (error) {
      res.status(500).json(error)
    })
  }
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
  es.get({
    index: 'pp',
    type: 'case',
    id: req.params.caseId
  }).then(function (resp) {
    res.status(200).json({
      OK: true,
      data: resp
    })
  }, function (resp) {
    res.status(500).json('uh-oh')
  })

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
