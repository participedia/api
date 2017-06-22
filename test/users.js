let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

const flip = str => str.split("").reverse().join("");
const flipUrl = str => {
  const parts = str.split("/");
  parts.push(flip(parts.pop()));
  parts.join("/");
};

describe("Users", () => {
  describe("Lookup", () => {
    it("finds user 100", async () => {
      const res = await chai.getJSON("/user/100").send({});
      res.should.have.status(200);
    });
  });
  describe("Get user with stuff", () => {
    it("This user should have 2 cases, 5 methods, 2 organizations", async () => {
      const res = await chai.getJSON("/user/25").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let user = res.body.data;
      user.cases.should.have.lengthOf(2);
      user.methods.should.have.lengthOf(5);
      user.organizations.should.have.lengthOf(2);
    });
    it("This user should have 1 bookmarked case and two bookmarked methods", async () => {
      const res = await chai.getJSON("/user/100").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let user = res.body.data;
      user.bookmarks.should.have.lengthOf(3);
      let bookmarks = user.bookmarks.map(bookmark => bookmark.type);
      bookmarks.sort();
      bookmarks.should.deep.equal(["case", "method", "method"]);
    });
    it("Make sure if there is a lead_image that it is an object with a url property", async () => {
      const res = await chai.getJSON("/user/134860").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let user = res.body.data;
      user.cases.should.have.lengthOf(42);
      user.cases.forEach(theCase => {
        if (theCase.lead_image) {
          theCase.lead_image.url.should.be.a("string");
        }
      });
    });
  });
  describe("modify user", () => {
    it("change department, website, organization", async () => {
      const res1 = await chai
        .getJSON("/user/")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({});
      const origUser = res1.body.data;
      const picture_url = origUser.picture_url ===
        "http://livingcode.org/images/stone_spiral.jpg"
        ? "http://livingcode.org/images/creek.jpg"
        : "http://livingcode.org/images/stone_spiral.jpg";
      const department = origUser.department
        ? flip(origUser.department)
        : "Redundancy & Repitition";
      const website = origUser.website
        ? ""
        : "https://pirateparty.ca/platforms/";
      const organization = origUser.organization === 204 ? 209 : 204;
      await chai
        .postJSON("/user/")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send(
          Object.assign({}, origUser, {
            department,
            website,
            organization,
            picture_url
          })
        );
      const res2 = await chai
        .getJSON("/user/")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({});
      const newUser = res2.body.data;
      newUser.department.should.equal(department);
      newUser.website.should.equal(website);
      newUser.organization.should.equal(organization);
    });
  });
});
