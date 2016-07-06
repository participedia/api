'use strict';

var process = require('process')
require('dotenv').config({silent: process.NODE_ENV == 'production'})
var express = require('express')
var SwaggerExpress = require('swagger-express-mw')
var app = require('express')()
module.exports = app; // for testing
var jwt = require('./api/helpers/jwt')()

// Set up the token security handler
var config = {
  appRoot: __dirname, // required config
  validateResponse: false,
  swaggerSecurityHandlers: {
    token: function(req, authOrSecDef, scopesOrApiKey, cb) {
      jwt(req, req.res, function(err) {
        if (err) { console.log("err:", err) }
        if (req.user == undefined) {
          return cb(new Error('access denied - user does not exist in auth0'));
        }
        else {
          // console.log(req.user); // Contains { iss: 'https://xxx.auth0.com/', sub: 'auth0|xxx', ... }
          return cb(null)
        }
      })
    }
  }
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(express.static('docs'));

module.exports = {
  config: config,
  app: app
}
