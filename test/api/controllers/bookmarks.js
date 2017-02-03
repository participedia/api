var tokens = require('../../setupenv')
var request = require('supertest')
var test = require('tape')
var app = require('../../../app')
// var log = require('winston')

test('/bookmark/add fails to add a bookmark without authentication', function (t) {
  request(app)
    .post('/bookmark/add')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send()
    .expect(401)
    .expect('Content-Type', /json/)
    .end(function(err,res) {
      t.end()
    })
})

test('/bookmark/add adds a bookmark with authentication', function (t) {
  request(app)
    .post('/bookmark/add')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + tokens.user_token)
    .send({
      "bookmarkType": "case",
      "thingID": 1
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.end()
      if (err) throw err;
    })
})

test('/bookmark/list shows something', function (t) {
  request(app)
    .get('/bookmark/list/123') // Known userid
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + tokens.user_token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, "No error");
      t.end()
    })
})
