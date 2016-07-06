  // var should = require('should');
var request = require('supertest');
var server = require('../app');
var test = require('tape');
var SwaggerExpress = require('swagger-express-mw');

var {config, app} = require('../app')

const bearerToken = "Bearer " + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRhdmlkLmFzY2hlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXBwX21ldGFkYXRhIjp7ImF1dGhvcml6YXRpb24iOnsiZ3JvdXBzIjpbIkN1cmF0b3JzIiwiQ29udHJpYnV0b3JzIl19fSwiaXNzIjoiaHR0cHM6Ly9wYXJ0aWNpcGVkaWEuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAyOTA5ODUyMDU5OTY0NzE4MjY5IiwiYXVkIjoibE9SUG1FT05nWDJLNzFTWDdmazM1WDVQTlpPQ2FTZlUiLCJleHAiOjE0Njc4NTgyMDAsImlhdCI6MTQ2NzgyMjIwMH0.IgundgODUo1UhzxZBkDzg8iyP_86hJJRXH7bT11-S1E"

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  test('newCase creates a case', function (t) {
    const body = {'id':1000, 'title':'meathead'}
    request(app)
      .put('/case/new')
      .set('Authorization', bearerToken)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify(body))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        t.error(err, 'No error');
        t.same(res.body, body, 'Case created as expected');
        t.end();
      })
  })

})
