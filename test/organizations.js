let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe("Organizations", () => {
  describe("Lookup", () => {
    it("finds organization 307", done => {
      chai
        .request(app)
        .get("/organization/307")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("Adding", () => {
    it("fails without authentication", done => {
      chai
        .request(app)
        .post("/organization/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("fails without content", done => {
      chai
        .request(app)
        .post("/organization/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("works with authentication", done => {
      chai
        .request(app)
        .post("/organization/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "Up the organization",
          body: "Guerilla Marketing",
          // optional
          photo: "",
          vidURL: "https://www.youtube.com/watch?v=KVc6rywClWk&t=2078s",
          geoSuggest: "???",
          relatedCases: ""
        })
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });
  describe("Get organization with tags", () => {
    it("should have 5 tags", done => {
      chai
        .request(app)
        .get("/organization/212")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let the_organization = res.body.data;
          the_organization.tags.should.have.lengthOf(5);
          done();
        });
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", done => {
      chai
        .request(app)
        .get("/organization/268")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.related_cases.should.have.lengthOf(0);
          res.body.data.related_methods.should.have.lengthOf(0);
          res.body.data.related_organizations.should.have.lengthOf(0);
          done();
        });
    });
    it("test related objects with single item", done => {
      chai
        .request(app)
        .get("/organization/269")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.related_cases.should.have.lengthOf(1);
          res.body.data.related_cases[0].id.should.equal(66);
          res.body.data.related_methods.should.have.lengthOf(1);
          res.body.data.related_methods[0].id.should.equal(166);
          res.body.data.related_organizations.should.have.lengthOf(1);
          res.body.data.related_organizations[0].id.should.equal(266);
          done();
        });
    });
    it("test related objects with multiple items", done => {
      chai
        .request(app)
        .get("/organization/270")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.related_cases.should.have.lengthOf(3);
          res.body.data.related_methods.should.have.lengthOf(2);
          res.body.data.related_organizations.should.have.lengthOf(2);
          done();
        });
    });
  });
});
