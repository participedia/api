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

var db = require('../helpers/db')


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
     db.task(function(t){
         let organizationId = req.params.organizationId;
         return t.batch([
             t.one('SELECT * FROM organizations, organization__localized_texts WHERE organizations.id = organization__localized_texts.organization_id AND  organizations.id = $1;',organizationId),
             t.any('SELECT users.name, users.id, organization__authors.timestamp FROM users, organization__authors WHERE users.id = organization__authors.author_id AND organization__authors.organization_id = $1', organizationId),
             t.any('SELECT * FROM organization__attachments WHERE organization__attachments.organization_id = $1', organizationId),
             t.any('SELECT tag FROM organization__tags WHERE organization__tags.organization_id = $1', organizationId),
             t.any('SELECT * FROM organization__videos WHERE organization__videos.organization_id = $1', organizationId),
             t.one('SELECT * FROM organization__locations WHERE organization__locations.organization_id = $1', organizationId)
         ]);
    }).then(function(data){
        let organization = data[0];
        organization.authors = data[1]; // authors
        let attachments = data[2]; // files and images
        organization.other_images = []
        organization.files = []
        attachments.forEach(function(att){
            if (att.type == 'file'){
                organization.files.push(att);
            }else if (att.type == 'image'){
                if (att.is_lead){
                    organization.lead_image = att;
                }else{
                    organization.other_images.push(att);
                }
            }
        });
        organization.tags = data[3];
        organization.videos = data[4];
        organization.location = data[5]; // geolocation
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
