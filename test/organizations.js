var tokens = require('./setupenv')
var request = require('supertest')
var app = require('../app')
var log = require('winston')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('Organizations', () => {
  describe('Lookup', () => {
    it('finds organization 307', (done) => {
      chai.request(app)
        .get('/organization/307')
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
        .post('/organization/new')
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
        .post('/organization/new')
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
  describe('Get organization with tags', () => {
    it('should have 5 tags', (done) => {
      chai.request(app)
        .get('/organization/212')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
            res.body.OK.should.equal(true)
            res.should.have.status(200);
            let the_organization = res.body.data;
            the_organization.tags.should.have.lengthOf(5);
            done();
        });
    });
  });
});
