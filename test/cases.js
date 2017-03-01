var tokens = require('./setupenv')
var request = require('supertest')
var app = require('../app')
var log = require('winston')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('Cases', () => {
  describe('Lookup', () => {
    it('finds case 100', (done) => {
      chai.request(app)
        .get('/case/100')
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
        .post('/case/new')
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
        .post('/case/new')
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
  let userID = tokens.user_payload.user_id;
  describe('Counting by country', () => {
    it('returns stuff', (done) => {
      chai.request(app)
        .get('/case/countsByCountry')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + tokens.user_token)
        .end((err, res) => {
          var countryCounts = res.body.data.countryCounts
          countryCounts.should.have.property('france')
          res.should.have.status(200);
          done();
        });
    });
  });
  describe('Get case with tags', () => {
    it('should have 3 tags', (done) => {
      chai.request(app)
        .get('/case/39')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
            res.body.OK.should.equal(true)
            res.should.have.status(200);
            let the_case = res.body.data;
            the_case.tags.should.have.lengthOf(3);
            done();
        });
    });
  });
});
