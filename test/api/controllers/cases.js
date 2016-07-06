var should = require('should');
var request = require('supertest');
var server = require('../../../app');

var test = require('tape');
// 
// test('First test!', function (t) {
//   t.end();
// });


describe('controllers', function() {

  describe('cases', function() {

    describe('GET /newCase', function() {

      it('should create a new case', function(done) {

        request(server)
          .put('/newCase')
          .set('Accept', 'application/json')
          .send({'id': 1, 'title': 'cucumber'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql({'id':1, 'title': 'cucumber'});

            done();
          });
      });

    });

  });

});
