let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

describe("Users", () => {
  describe("Lookup", () => {
    it("finds user 100", done => {
      chai
        .request(app)
        .get("/user/100")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("Get user with stuff", () => {
    it("This user should have 2 cases, 5 methods, 2 organizations", done => {
      chai
        .request(app)
        .get("/user/25")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let user = res.body.data;
          user.cases.should.have.lengthOf(2);
          user.methods.should.have.lengthOf(5);
          user.organizations.should.have.lengthOf(2);
          done();
        });
    });
    it("This user should have 1 bookmarked case and two bookmarked methods", done => {
      chai
        .request(app)
        .get("/user/100")
        .set("Content-Type", "application.json")
        .set("Accept", "application.json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let user = res.body.data;
          console.log(
            "bokmarks: %s",
            JSON.stringify(user.bookmarks.map(b => b.id))
          );
          user.bookmarks.should.have.lengthOf(3);
          let bookmarks = user.bookmarks.map(bookmark => bookmark.type);
          bookmarks.sort();
          bookmarks.should.deep.equal(["case", "method", "method"]);
          done();
        });
    });
    it("Make sure if there is a lead_image that it is an object with a url property", done => {
      chai
        .request(app)
        .get("/user/134860")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let user = res.body.data;
          user.cases.should.have.lengthOf(42);
          user.cases.forEach(theCase => {
            if (theCase.lead_image) {
              theCase.lead_image.url.should.be.a("string");
            }
          });
          done();
        });
    });
  });
});
