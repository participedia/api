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
          relatedCases: ""
        })
        .end((err, res) => {
          res.should.have.status(201);
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
});
