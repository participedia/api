let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);

describe("Search", () => {
  describe("get first 30 cases", () => {
    it("finds 30 case titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=case&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 30);
          done();
        });
    });
  });
  describe("get first 30 methods", () => {
    it("finds 30 method titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=method&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 30);
          done();
        });
    });
  });
  describe("get first 30 organizations", () => {
    it("finds 30 organization titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=organization&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 30);
          done();
        });
    });
  });
  describe("get organizations in Canada", () => {
    it("finds all Organizations with the facet geo_country=Canada", done => {
      chai
        .request(app)
        .get(
          "/search?query=geo_country%3ACanada&selectedCategory=Organizations&sortingMethod=chronological"
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.results.should.have.lengthOf(1);
          res.body.results[0].type.should.equal("organization");
          // res.body.results[0].hits.should.have.lengthOf(17);
          done();
        });
    });
  });
});
