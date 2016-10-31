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

// Should not return things that aren't displayable as SearchHits (i.e. Users...)

router.get('/', function (req, res) {
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

  if (query) {
    console.log(query.indexOf(':'))
    if (query.indexOf(':') == -1) {
      body = body.query('match', "_all", query)
    } else {
      let parts = query.split(':', 2)
      body = body.query('match', parts[0], parts[1])
    }
  }
  if (sortingMethod === 'chronological') {
    body = body.sort('lastmodified', 'desc')
  } else {
    body = body.sort('id', 'asc') // Note this requires a non-analyzed field
  }
  let bodyquery = body.size(30).build('v2')

  if (query) {
    es.search({
      index: 'pp',
      type: 'case',
      body: bodyquery
    }).then(function success(ret) {
      // console.log("ret", ret);
      res.json(ret)
    }, function failure (error) {
      console.log("error", error);
      res.status(500).json(error);
    })
  } else {
    es.search({
      index: 'pp',
      type: 'case',
      match_all: {}
    }).then(function success (ret) {
      res.json(ret)
    }, function failure (error) {
      console.log("error", error);
      res.status(500).json(error)
    })
  }
})

module.exports = router
