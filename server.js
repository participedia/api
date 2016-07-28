'use strict'
var process = require('process')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})
var express = require('express')

var app = express()
var port = process.env.PORT || 3001
var case_ = require('./api/controllers/case')
var http = require('http')
var path = require('path')
var errorhandler = require('errorhandler')
// var favicon = require('serve-favicon')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cors = require('cors')

app.set('port', port)
// app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(morgan('dev'))
app.use(methodOverride())
app.use(cors())
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'doc')))
app.use(errorhandler())

app.use('/case', case_)

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
