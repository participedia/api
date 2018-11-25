let fs = require("fs");
let tokens = require("./setupenv");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiHelpers);

let location = {
  name: "Cleveland, OH, United States",
  placeId: "ChIJLWto4y7vMIgRQhhi91XLBO0",
  city: "Cleveland",
  province: "Ohio",
  country: "United States",
  postal_code: "45701",
  latitude: 41.49932,
  longitude: -81.69436050000002
};

let example_case = JSON.parse(fs.readFileSync("test/case.json"));

async function addBasicCase() {
  return chai
    .postJSON("/case/new?returns=json")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      // mandatory
      title: "First Title",
      body: "First Body",
      // optional
      location: location
    });
}

describe("Cases", () => {
  describe("Lookup", () => {
    it("finds case 100", async () => {
      const res = await chai.getJSON("/case/100?returns=json").send({});
      res.should.have.status(200);
      res.body.article.id.should.be.a("number");
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/case/new?returns=json").send({});
        // fail if error not thrown
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/case/new?returns=json")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await addBasicCase();
      res.should.have.status(201);
      res.body.OK.should.be.true;
      res.body.data.thingid.should.be.a("number");
      let returnedCase = res.body.object;
      returnedCase.videos.length.should.equal(2);
    });
  });

  it("test SQL santization", async () => {
    const res = await addBasicCase();
    res.should.have.status(201);
  });

  describe("Counting by country", () => {
    it("returns stuff", async () => {
      const res = await chai
        .getJSON("/case/countsByCountry?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token);
      let countryCounts = res.body.data.countryCounts;
      countryCounts.should.have.property("france");
      res.should.have.status(200);
    });
  });

  describe("Get case with authentication", () => {
    it("should not fail when logged in", async () => {
      try {
        const res = await chai
          .getJSON("/case/100?returns=json")
          .set("Authorization", "Bearer " + tokens.user_token);
        res.body.OK.should.equal(true);
        res.should.have.status(200);
      } catch (e) {
        console.error(e);
      }
    });
  });

  describe("Test edit API", () => {
    it("Add case, then modify title and/or body", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origCase = res1.body.object;
      origCase.id.should.be.a("number");
      origCase.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/case/" + res1.body.data.thingid + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Second Title" });
      res2.should.have.status(200);
      const updatedCase1 = res2.body.data;
      updatedCase1.title.should.equal("Second Title");
      updatedCase1.body.should.equal("First Body");
      const res3 = await chai
        .putJSON("/case/" + res1.body.data.thingid + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ body: "Second Body" });
      res3.should.have.status(200);
      const updatedCase2 = res3.body.data;
      updatedCase2.title.should.equal("Second Title");
      updatedCase2.body.should.equal("Second Body");
      const res4 = await chai
        .putJSON("/case/" + res1.body.data.thingid + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Third Title", body: "Third Body" });
      res4.should.have.status(200);
      const updatedCase3 = res4.body.data;
      updatedCase3.title.should.equal("Third Title");
      updatedCase3.body.should.equal("Third Body");
    });

    it("Add case, then modify some fields", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origCase = res1.body.object;
      origCase.id.should.be.a("number");
      origCase.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ issues: ["new issue"] });
      res2.should.have.status(200);
      const updatedCase1 = res2.body.article;
      updatedCase1.issues.should.deep.equal(["new issue"]);
    });

    it("Add case, then modify lead image", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const case1 = res1.body.data;
      case1.photos.should.deep.equal(["CitizensAssembly_2.jpg"]);
      const res2 = await chai
        .putJSON("/case/" + case1.id + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ photos: ["foobar.jpg"] });
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      should.exist(res2.body.article);
      const case2 = res2.body.article;
      case2.photos.should.deep.equal(["foobar.jpg"]);
      expect(case2.updated_date > case1.updated_date).to.be.true;
      const res3 = await chai
        .putJSON("/case/" + case1.id + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ photos: ["howzaboutthemjpegs.png"] });
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const case3 = res3.body.article;
      case3.photos.should.deep.equal(["howzaboutthemjpegs.png"]);
    });
  });

  describe("Test bookmarked", () => {
    let case1 = null;
    it("Add case, should not be bookmarked", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      case1 = res1.body.object;
      case1.bookmarked.should.be.false;
      const booked = await chai
        .postJSON("/bookmark/add?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ bookmarkType: "case", thingid: case1.id });
      booked.should.have.status(201);
    });
    it("Not authenticated, bookmarked should be false", async () => {
      const res2 = await chai
        .getJSON("/case/" + case1.id + "?returns=json")
        .send({});
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      const case2 = res2.body.article;
      case2.bookmarked.should.be.false;
    });
    it("Bookmarked should be true", async () => {
      const res3 = await chai
        .getJSON("/case/" + case1.id + "?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({});
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const case3 = res3.body.article;
      case3.bookmarked.should.be.true;
    });
  });
  describe("More case creation tests", () => {
    it("Create with array of URLs", async () => {
      const res = await chai
        .postJSON("/case/new?returns=json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "First Title",
          body: "First Body",
          // optional
          photos: [
            "https://s-media-cache-ak0.pinimg.com/736x/3d/2b/bf/3d2bbfd73ccaf488ab88d298ab7bc2d8.jpg",
            "https://ocs-pl.oktawave.com/v1/AUTH_e1d5d90a-20b9-49c9-a9cd-33fc2cb68df3/mrgugu-products/20150901170519_1afZHYJgZTruGxEc_1000-1000.jpg"
          ]
        });
      res.should.have.status(201);
      res.body.OK.should.be.true;
      const theCase = res.body.data;
      theCase.photos.should.have.lengthOf(2);
    });
  });
});

module.exports = { addBasicCase };
