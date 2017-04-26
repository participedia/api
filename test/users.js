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
          user.bookmarks.should.have.lengthOf(3);
          user.bookmarks[0].type.should.equal("case");
          user.bookmarks[1].type.should.equal("method");
          user.bookmarks[2].type.should.equal("method");
          done();
        });
    });
  });
});
