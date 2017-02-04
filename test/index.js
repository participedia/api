var process = require('process')
var request = require('supertest')
var test = require('tape')
require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

var app = require('../app')

test('/case/countsByCountry returns stuff', function (t) {
  request(app)
    .get('/case/countsByCountry')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      if (!('countryCounts' in res.body.data))
        throw new Error("missing countryCounts");
    })
    .end(function (err, res) {
      t.error(err, 'No error')
      t.end()
    })
})
