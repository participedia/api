'use strict'
var express = require('express')
var router = express.Router()
var groups = require('../helpers/groups')
var cache = require('apicache')
var log = require('winston')
var jsonStringify = require('json-pretty');
var {db, sql} = require('../helpers/db');

 router.get('/:userId', function getUserById (req, res) {
     db.one(sql('../sql/user_by_id.sql'), {userId: req.params.userId, language: req.params.language || 'en'})
    .then(function(user){
        console.log('user: %s', user);
         res.status(200).json({
             OK: true,
             data: user
         })
     }).catch(function(error){
         log.error("Exception in GET /user/%s => %s", req.params.userId, error)
         res.status(500).json({
             OK: false,
             error: error
         })
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
  cache.clear()
  groups.user_has(req, 'Contributors', function () {
    console.error("user doesn't have Contributors group membership")
    res.status(401).json({message: 'access denied - user does not have proper authorization'})
    return
  }, function () {
    var caseId = req.swagger.params.caseId.value
    var caseBody = req.body
    res.status(200).json(req.body)
  })
})

module.exports = router
