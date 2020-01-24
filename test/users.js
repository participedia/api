let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

const flip = str =>
  str
    .split("")
    .reverse()
    .join("");
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
  describe("modify user", () => {
    it("change department, website, organization", async () => {
      const res1 = await chai.getJSON("/user/100?returns=json").send({});
      const origUser = res1.body.profile;
      const picture_url =
        origUser.picture_url === "http://livingcode.org/images/stone_spiral.jpg"
          ? "http://livingcode.org/images/creek.jpg"
          : "http://livingcode.org/images/stone_spiral.jpg";
      await chai
        .postJSON("/user/")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send(
          Object.assign({}, origUser, {
            picture_url,
          })
        );
      const res2 = await chai
        .getJSON("/user/")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({});
      const newUser = res2.body.profile;
    });
  });
});
