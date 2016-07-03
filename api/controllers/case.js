'use strict';

var util = require('util');
var process = require('process');
var groups = require('../helpers/groups');

function newCase(req, res) {
  groups.user_has(req, 'Curators', function() {
    console.log("user doesn't have curators")
    res.status(401).json({message:'access denied - user does not have proper authorization'});
  }, function () {
    console.log("user is in curators group")
    res.json(req.body);
  })
}

module.exports = {
  newCase: newCase
};
