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
var Bodybuilder = require('bodybuilder')
var jsonStringify = require('json-pretty');

var {db, sql} = require('../helpers/db')


/**
 * @api {post} /organization/new Create new organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName newOrganization
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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
      type: 'organization',
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
 * @api {put} /organization/:id  Submit a new version of a organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName editOrganization
 * @apiParam {Number} id Organization ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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

router.put('/:id', function editOrgById (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var orgId = req.swagger.params.id.value
    res.status(200).json(req.body)
  })})

/**
 * @api {get} /organization/:id Get the last version of an organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName getOrgById
 * @apiParam {Number} id Organization ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} Organization data
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

 router.get('/:organizationId', function getorganizationById (req, res) {
     db.one(sql('../sql/organization_by_id.sql'), {organizationId: req.params.organizationId, lang: req.params.language || 'en'})
    .then(function(organization){
         res.status(200).json({
             OK: true,
             data: organization
         })
     }).catch(function(error){
         log.error("Exception in GET /organization/%s => %s", req.params.organizationId, error)
         res.status(500).json({
             OK: false,
             error: error
         })
     })
 })

/**
 * @api {delete} /organization/:id Delete an organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName deleteOrganization
 * @apiParam {Number} Organization ID
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

router.delete('/:id', function deleteOrganization (req, res) {
  groups.user_has(req, 'Contributors', function () {
    console.log("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var orgId = req.swagger.params.id.value
    res.status(200).json(req.body)
  })
})

module.exports = router
