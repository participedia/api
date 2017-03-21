var tokens = require('./setupenv')
var request = require('supertest')
var app = require('../app')
var log = require('winston')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('Methods', () => {
  describe('Lookup', () => {
    it('finds method 190', (done) => {
      chai.request(app)
        .get('/method/190')
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
  describe('Adding', () => {
    it('fails without authentication', (done) => {
      chai.request(app)
        .post('/method/new')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('works with authentication', (done) => {
      chai.request(app)
        .post('/method/new')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + tokens.user_token)
        .send({
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe('Get method with tags', () => {
    it('should have 7 tags', (done) => {
      chai.request(app)
        .get('/method/428')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
            res.body.OK.should.equal(true)
            res.should.have.status(200);
            let the_method = res.body.data;
            the_method.tags.should.have.lengthOf(7);
            done();
        });
    });
  });
});
