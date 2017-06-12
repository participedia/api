let tokens = require("./setupenv"); // setupenv has to be imported before app
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe("Search", () => {
  describe("get first 20 cases", () => {
    it("finds 20 case titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=case&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 20);
          done();
        });
    });
  });
  describe("get first 20 methods", () => {
    it("finds 20 method titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=method&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 20);
          done();
        });
    });
  });
  describe("get first 20 organizations", () => {
    it("finds 20 organization titles and ids", done => {
      chai
        .request(app)
        .get("/search/getAllForType?objType=organization&page=1")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          should.equal(Object.keys(res.body).length, 20);
          done();
        });
    });
  });
  describe.skip("get organizations in Canada", () => {
    it("finds all Organizations with the term Canada", done => {
      chai
        .request(app)
        .get("/search?query=Canada&selectedCategory=Organizations")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.OK.should.equal(true);
          res.body.results.should.have.lengthOf(17);
          res.body.results.forEach(obj =>
            obj.type.should.equal("organization"));
          done();
        });
    });
  });
  describe("get cases tagged 'nuclear'", () => {
    it("finds all Cases with the word nuclear", done => {
      chai
        .request(app)
        .get("/search?query=nuclear&selectedCategory=Cases")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.OK.should.equal(true);
          res.body.results.should.have.lengthOf(3);
          res.body.results[0].type.should.equal("case");
          done();
        });
    });
  });
  describe.skip("Test search with multi-word tags", () => {
    it("finds everything with the words animal welfare", done => {
      chai
        .request(app)
        .get("/search?query=animal%20welfare")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.OK.should.equal(true);
          res.body.results.should.have.lengthOf(2);
          // more testing
          done();
        });
    });
  });
  describe("Test full-text search", () => {
    it("single-word search", done => {
      chai
        .request(app)
        .get("/search?query=Budget")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.results.should.have.lengthOf(20);
          const item = res.body.results[0];
          item.title.should.be.a("string");
          item.body.should.be.a("string");
          item.id.should.be.a("number");
          item.type.should.be.a("string");
          item.updated_date.should.be.a("string");
          item.bookmarked.should.be.a("boolean");
          item.should.have.property("lead_image");
          done();
        });
    });
    it("multi-word search", done => {
      chai
        .request(app)
        .get("/search?query=Budget%20Participatory")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.results.should.have.lengthOf(20);
          done();
        });
    });
  });
});
