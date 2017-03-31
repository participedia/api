let tokens = require("./setupenv");
let app = require("../app");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

describe("Bookmarks", () => {
  describe("Adding", () => {
    it("fails without authentication", done => {
      chai
        .request(app)
        .post("/bookmark/add")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          bookmarkType: "case",
          thingID: 1
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("works with authentication", done => {
      chai
        .request(app)
        .post("/bookmark/add")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          bookmarkType: "case",
          thingID: 1
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          done();
        });
    });
  });
  let userID = tokens.user_payload.user_id;
  describe("Listing", () => {
    it("returns stuff", done => {
      chai
        .request(app)
        .get("/bookmark/list/" + userID)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
