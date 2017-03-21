var tokens = require('./setupenv')
var request = require('supertest')
var app = require('../app')
var log = require('winston')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('Search', () => {
  describe('getAllForType', () => {
    it('finds 30 case titles and ids', (done) => {
      chai.request(app)
        .get('/search/getAllForType?objType=case&page=1')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
