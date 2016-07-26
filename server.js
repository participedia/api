'use strict'

var SwaggerExpress = require('swagger-express-mw')
var process = require('process')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

var { config, app } = require('./app')

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) { throw err }

  swaggerExpress.register(app)

  var port = process.env.PORT || 10010
  console.log('Starting the API server at port:', port)
  app.listen(port)
})
