let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_case,
  addBasicCase
} = require("./data/helpers.js");
const {
  getCaseEditHttp,
  getCaseNewHttp,
  postCaseNewHttp,
  getCaseHttp,
  postCaseUpdateHttp
} = require("../api/controllers/case");

describe("Cases", () => {
  describe("Lookup", () => {
    it("finds case 100", async () => {
      const { req, res, ret } = getMocks({ params: { thingid: 100 } });
      await getCaseHttp(req, res);
      const article = ret.body.article;
      ret.body.OK.should.be.true;
      article.id.should.equal(100);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      const { req, res, ret } = getMocks({ body: example_case });
      try {
        await postCaseNewHttp(req, res);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const { req, res, ret } = getMocksAuth({});
        await postCaseNewHttp(req, res);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const body = await addBasicCase();
      body.OK.should.be.true;
      let returnedCase = body.article;
      returnedCase.id.should.be.a("number");
      returnedCase.videos.length.should.equal(2);
      returnedCase.creator.user_id.should.equal(
        returnedCase.last_updated_by.user_id
      );
      // returnedCase.scope_of_influence.key.should.equal(
      //   example_case.scope_of_influence.key
      // );
      returnedCase.public_spectrum.key.should.equal(
        example_case.public_spectrum.key
      );
      returnedCase.legality.key.should.equal(example_case.legality.key);
    });
  });

  it.skip("test SQL sanitization", async () => {
    const body = await addBasicCase();
    // actually test this!
  });

  describe("Get case with authentication", () => {
    it("should not fail when logged in", async () => {
      const body = await addBasicCase();
      body.OK.should.equal(true);
    });
  });

  describe("Test edit API", () => {
    it("Add case, then modify title and/or body", async () => {
      const body1 = await addBasicCase();
      body1.OK.should.be.true;
      body1.article.id.should.be.a("number");
      const origCase = body1.article;
      origCase.title.should.equal("First Title");
      origCase.body.should.equal("First Body");
      origCase.description.should.equal("First Description");
      const { req, res, ret } = getMocksAuth({
        params: { thingid: origCase.id },
        body: {
          title: "Second Title",
          body: "Second Body",
          description: "Second Description"
        }
      });
      await postCaseUpdateHttp(req, res);
      const body2 = ret.body;
      const updatedCase = body2.article;
      updatedCase.title.should.equal("Second Title");
      updatedCase.body.should.equal("Second Body");
      updatedCase.description.should.equal("Second Description");
      updatedCase.last_updated_by.user_id.should.not.equal(
        origCase.last_updated_by.user_id
      );
    });

    it("Add case, then modify some fields", async () => {
      const body1 = await addBasicCase();
      body1.OK.should.be.true;
      body1.article.id.should.be.a("number");
      const origCase = body1.article;
      origCase.general_issues.length.should.equal(4);
      origCase.general_issues[0].key.should.equal("arts");
      origCase.general_issues[1].key.should.equal("education");
      origCase.general_issues[2].key.should.equal("environment");
      origCase.general_issues[3].key.should.equal("planning");
      const { req, res, ret } = getMocksAuth({
        params: { thingid: origCase.id },
        body: {
          general_issues: [
            { key: "arts", value: "Arts, Culture, & Recreation" }
          ]
        }
      });
      await postCaseUpdateHttp(req, res);
      const updatedCase = ret.body.article;
      updatedCase.general_issues.length.should.equal(1);
      updatedCase.general_issues[0].key.should.equal("arts");
    });

    it("Add case, then modify lead image", async () => {
      const body1 = await addBasicCase();
      body1.OK.should.be.true;
      const case1 = body1.article;
      case1.photos.length.should.equal(4);
      case1.photos[0].url.should.equal(
        "https://s3.amazonaws.com/uploads.participedia.xyz/index.php__21.jpg"
      );
      const { req, res, ret } = getMocksAuth({
        params: { thingid: case1.id },
        body: {
          photos: [{ url: "foobar.jpg" }]
        }
      });
      await postCaseUpdateHttp(req, res);
      const case2 = ret.body.article;
      case2.photos.length.should.equal(1);
      case2.photos[0].url.should.equal(
        "https://s3.amazonaws.com/uploads.participedia.xyz/foobar.jpg"
      );
      expect(case2.updated_date > case1.updated_date).to.be.true;
    });
  });

  // need to import bookmark methods. do this in the bookmark test suite?
  describe.skip("Test bookmarked", () => {
    let case1 = null;
    it("Add case, should not be bookmarked", async () => {
      const body1 = await addBasicCase();
      body1.OK.should.be.true;
      case1 = body1.article;
      case1.bookmarked.should.be.false;
      const booked = await chai
        .postJSON("/bookmark/add?returns=json")
        .set("Cookie", "token=" + tokens.user_token)
        .send({ bookmarkType: "case", thingid: case1.id });
      booked.should.have.status(200);
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
        .set("Cookie", "token=" + tokens.user_token)
        .send({});
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const case3 = res3.body.article;
      case3.bookmarked.should.be.true;
    });
  });
});
