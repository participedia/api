var request = require('supertest')
var test = require('tape')
var process = require('process')
var SwaggerExpress = require('swagger-express-mw')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

var {config, app} = require('../app')

const bearerToken = 'Bearer ' + process.env.BEARER_TOKEN

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) { throw err }

  swaggerExpress.register(app)

  test('newCase creates a case', function (t) {
    const body = {'id': 1000, 'title': 'meathead'}
    request(app)
      .put('/case/new')
      .set('Authorization', bearerToken)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify(body))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        t.error(err, 'No error')
        t.same(res.body, body, 'Case created as expected')
        t.end()
      })
  })
})
