let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

describe("Cases", () => {
  describe("Lookup", () => {
    it("finds case 100", done => {
      chai
        .request(app)
        .get("/case/100")
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
        .post("/case/new")
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
        .post("/case/new")
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
        .post("/case/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "This is the first title of the rest of your post",
          summary: "Eat this, it is my body",
          // optional
          photo: "", // not sure what the client wants to send here
          vidURL: "https://www.youtube.com/watch?v=QF7g3rCnD-w",
          geoSuggest: "???", // not sure what the client thinks it is sending here
          relatedCases: "" // not sure what the client expects to send here
        })
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });
  // let userID = tokens.user_payload.user_id;
  describe("Counting by country", () => {
    it("returns stuff", done => {
      chai
        .request(app)
        .get("/case/countsByCountry")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .end((err, res) => {
          let countryCounts = res.body.data.countryCounts;
          countryCounts.should.have.property("france");
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("Get case with tags", () => {
    it("should have 3 tags", done => {
      chai
        .request(app)
        .get("/case/39")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let the_case = res.body.data;
          the_case.tags.should.have.lengthOf(3);
          done();
        });
    });
  });
});
