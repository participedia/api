'use strict'

var path = require('path')
var process = require('process')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})
var app = require('express')()
var jwt = require('./api/helpers/jwt')()

// Set up the token security handler
var config = {
  appRoot: path.join(__dirname, '..'), // required config
  validateResponse: false
}
var express = require('express')
var compression = require('compression')
var AWS = require("aws-sdk")

var app = express()
app.use(compression())
var port = process.env.PORT || 3001
var case_ = require('./api/controllers/case')
var search = require('./api/controllers/search')
var organization = require('./api/controllers/organization')
var user = require('./api/controllers/user')
var bookmark = require('./api/controllers/bookmark')
var method = require('./api/controllers/method')
var http = require('http')
var path = require('path')
var errorhandler = require('errorhandler')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cors = require('cors')
var isUser = require('./api/middleware/isUser')
var jwt = require('express-jwt');

app.set('port', port)
app.use(morgan('dev'))
app.use(methodOverride())
app.use(cors())
app.use(bodyParser.json())
console.log("AUTH0_CLIENT_SECRET", process.env.AUTH0_CLIENT_SECRET)
app.use(jwt({
  secret: process.env.AUTH0_CLIENT_SECRET, 
  credentialsRequired: false,
  algorithms: ['HS256']
}).unless({'method': ['OPTIONS', 'GET']}))
app.use(express.static(path.join(__dirname, 'swagger')))
app.use(errorhandler())


var cache = require('apicache').middleware
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

app.use('/search', cache('5 minutes'), search)

app.use('/case', case_)
app.use('/organization', organization)
app.use('/method', method)
app.use('/user', user)
app.use('/bookmark', bookmark)

app.use('/s3/:path', jwt({
  secret: process.env.AUTH0_CLIENT_SECRET}), isUser)
app.use('/s3', require('react-dropzone-s3-uploader/s3router')({
    bucket: 'uploads.participedia.xyz',
    region: 'us-east-1', //optional
    headers: {'Access-Control-Allow-Origin': '*'}, // optional
    ACL: 'private' // this is default
}))

module.exports = app