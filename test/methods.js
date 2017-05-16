let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

describe("Methods", () => {
  describe("Lookup", () => {
    it("finds method 190", done => {
      chai
        .request(app)
        .get("/method/190")
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
        .post("/method/new")
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
        .post("/method/new")
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
        })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.OK.should.be.true;
          res.body.data.method_id.should.be.a("number");
          let returnedMethod = res.body.object;
          returnedMethod.related_cases.length.should.equal(4);
          returnedMethod.related_methods.length.should.equal(3);
          returnedMethod.related_organizations.length.should.equal(3);
          done();
        });
    });
  });
  describe("Get method with tags", () => {
    it("should have 7 tags", done => {
      chai
        .request(app)
        .get("/method/428")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let the_method = res.body.data;
          the_method.tags.should.have.lengthOf(7);
          done();
        });
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", done => {
      chai
        .request(app)
        .get("/method/172")
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
        .get("/method/162")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.related_cases.should.have.lengthOf(1);
          res.body.data.related_cases[0].id.should.equal(65);
          res.body.data.related_methods.should.have.lengthOf(1);
          res.body.data.related_methods[0].id.should.equal(165);
          res.body.data.related_organizations.should.have.lengthOf(1);
          res.body.data.related_organizations[0].id.should.equal(265);
          done();
        });
    });
    it("test related objects with multiple items", done => {
      chai
        .request(app)
        .get("/method/161")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
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
          done();
        });
    });
  });
});
