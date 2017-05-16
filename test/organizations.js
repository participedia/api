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
    it("finds organization 307", async () => {
      const res = await chai.getJSON("/organization/307").send({});
      res.should.have.status(200);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/organization/new").send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/organization/new")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await chai
        .postJSON("/organization/new")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "Up the organization",
          body: "Guerilla Marketing",
          // optional
          vidURL: "https://www.youtube.com/watch?v=KVc6rywClWk&t=2078s",
          related_cases: []
        });
      res.should.have.status(201);
    });
  });
  describe("Get organization with tags", () => {
    it("should have 5 tags", async () => {
      const res = await chai.getJSON("/organization/212").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let the_organization = res.body.data;
      the_organization.tags.should.have.lengthOf(5);
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", async () => {
      const res = await chai.getJSON("/organization/268").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(0);
      res.body.data.related_methods.should.have.lengthOf(0);
      res.body.data.related_organizations.should.have.lengthOf(0);
    });
    it("test related objects with single item", async () => {
      const res = await chai.getJSON("/organization/269").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(1);
      res.body.data.related_cases[0].id.should.equal(66);
      res.body.data.related_methods.should.have.lengthOf(1);
      res.body.data.related_methods[0].id.should.equal(166);
      res.body.data.related_organizations.should.have.lengthOf(1);
      res.body.data.related_organizations[0].id.should.equal(266);
    });
    it("test related objects with multiple items", async () => {
      const res = await chai.getJSON("/organization/270").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(3);
      res.body.data.related_methods.should.have.lengthOf(2);
      res.body.data.related_organizations.should.have.lengthOf(2);
    });
  });
});
