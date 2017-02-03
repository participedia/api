var request = require('supertest')
var test = require('tape')
var app = require('../../../app')
var tokens = require('../../setupenv')

test('/case/newCase fails to add a case without authentication', function (t) {
  request(app)
    .post('/case/new')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.end()
    })
})

test('/case/newCase adds a case with authentication', function (t) {
  request(app)
    .post('/case/new')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + tokens.user_token)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.end()
    })
})

