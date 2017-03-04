'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var es = require('../helpers/es')
var ddb = require('../helpers/ddb')
var AWS = require("aws-sdk");
var db = require('../helpers/db')

if (typeof Promises === 'undefined') {
  var Promises = require('promise-polyfill')
}

var Bodybuilder = require('bodybuilder')
var jsonStringify = require('json-pretty');

router.get('/getAllForType', function (req, res) {
  let objType = req.query.objType.toLowerCase()
  if (objType !== 'organization' && objType !== 'case' && objType !== 'method') {
    res.status(401).json({message: 'Unsupported objType for getAllForType: ' + objType})
  }
  var params = {
    TableName : `pp_${objType}s`,
    IndexName : `title_en-index`
  };
  var docClient = new AWS.DynamoDB.DocumentClient();
  try {
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          let titles = {}
          data.Items.forEach(function (item) {
            titles[item['title_en']] = Number(item['id'])
          })
          res.json(titles)
        }
    });
  } catch (e) {
    console.log(`Exception in /getAllForType: ${e}`)
  }
})

/**
 * @api {get} /search Search through the cases
 * @apiGroup Search
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
    selectedCategory = 'All'
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
  let includeCases = selectedCategory === 'All' || selectedCategory === 'Cases'
  let includeMethods = selectedCategory === 'All' || selectedCategory === 'Methods'
  let includeNews = selectedCategory === 'All' || selectedCategory === 'News'
  let includeOrgs = selectedCategory === 'All' || selectedCategory === 'Organizations'

  if (query) {
    let promises = []
    if (includeCases) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'case',
          body: bodyquery
        }).then(function (result) {
          return {type: 'case', hits: result['hits']['hits']}
        })
      )
    }
    if (includeOrgs) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'organization',
          body: bodyquery
        }).then(function (result) {
          return {type: 'organization', hits: result['hits']['hits']}
        })
      )
    }
    if (includeMethods) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'method',
          body: bodyquery
        }).then(function (result) {
          return {type: 'method', hits: result['hits']['hits']}
        })
      )
    }
    Promises.all(promises).then(
      function (results) {
        res.json({results: results});
      }, function failure(error) {
        console.log("error", error);
        res.status(500).json(error)
      }
    )
  } else {
    let promises = []
    if (includeCases) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'case',
          match_all: {}
        }).then(function (result) {
          return {type: 'case', hits: result['hits']['hits']}
        })
      )
    }
    if (includeOrgs) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'organization',
          match_all: {}
        }).then(function (result) {
          return {type: 'organization', hits: result['hits']['hits']}
        })
      )
    }
    if (includeMethods) {
      promises.push(
        es.search({
          index: 'pp',
          type: 'method',
          match_all: {}
        }).then(function (result) {
          return {type: 'method', hits: result['hits']['hits']}
        })
      )
    }
    Promises.all(promises).then(
      function (results) {
        res.json({results: results});
      }, function failure(error) {
        console.log("error", error);
        res.status(500).json(error)
      }
    )
  }
})

function searchCaseWithQuery(bodyquery) {

}

module.exports = router
