let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

async function addBasicMethod() {
  return chai
    .request(app)
    .post("/method/new")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      // mandatory
      title: "Rhythm",
      body: "Never fails",
      // optional
      lead_image: "https://cdn.thinglink.me/api/image/756598547733807104/",
      vidURL: "https://www.youtube.com/watch?v=ZPoqNeR3_UA&t=11050s",
      related_cases: [5, 6, 7, 8],
      related_methods: [148, 149, 150],
      related_organizations: [202, 203, 204]
    });
}

describe("Methods", () => {
  describe("Lookup", () => {
    it("finds method 190", async () => {
      const res = await chai.getJSON("/method/190").send({});
      res.should.have.status(200);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/method/new").send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/method/new")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await addBasicMethod();
      res.should.have.status(201);
      res.body.OK.should.be.true;
      res.body.data.method_id.should.be.a("number");
      let returnedMethod = res.body.object;
      returnedMethod.related_cases.length.should.equal(4);
      returnedMethod.related_methods.length.should.equal(3);
      returnedMethod.related_organizations.length.should.equal(3);
    });
  });
  describe("Get method with tags", () => {
    it("should have 7 tags", async () => {
      const res = await chai.getJSON("/method/428").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let the_method = res.body.data;
      the_method.tags.should.have.lengthOf(7);
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", async () => {
      const res = await chai.getJSON("/method/172").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(0);
      res.body.data.related_methods.should.have.lengthOf(0);
      res.body.data.related_organizations.should.have.lengthOf(0);
    });
    it("test related objects with single item", async () => {
      const res = await chai.getJSON("/method/162").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(1);
      res.body.data.related_cases[0].id.should.equal(65);
      res.body.data.related_methods.should.have.lengthOf(1);
      res.body.data.related_methods[0].id.should.equal(165);
      res.body.data.related_organizations.should.have.lengthOf(1);
      res.body.data.related_organizations[0].id.should.equal(265);
    });
    it("test related objects with multiple items", async () => {
      const res = await chai.getJSON("/method/161").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(2);
      res.body.data.related_cases[0].id.should.equal(47);
      res.body.data.related_cases[1].id.should.equal(52);
      res.body.data.related_methods.should.have.lengthOf(2);
      res.body.data.related_methods[0].id.should.equal(147);
      res.body.data.related_methods[1].id.should.equal(152);
      res.body.data.related_organizations.should.have.lengthOf(2);
      res.body.data.related_organizations[0].id.should.equal(247);
      res.body.data.related_organizations[1].id.should.equal(252);
    });
  });
});
