let tokens = require("./setupenv");
let app = require("../app");

let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
const { addBasicCase } = require("./cases");

chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe("Bookmarks", async () => {
  const outerRes = await addBasicCase();
  const caseid = outerRes.body.object.id;
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/bookmark/add").send({
          bookmarkType: "case",
          thingid: caseid
        });
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("works with authentication", async () => {
      const res = await chai
        .postJSON("/bookmark/add")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          bookmarkType: "case",
          thingid: caseid
        });
      res.body.success.should.be.eql(true);
    });
  });
  let userID = tokens.user_payload.user_id;
  describe("Listing", () => {
    it("returns stuff", async () => {
      const res = await chai
        .getJSON("/bookmark/list/" + userID)
        .set("Authorization", "Bearer " + tokens.user_token);
      res.should.have.status(200);
    });
  });
});
