let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_case,
  getCase,
  addBasicCase,
  updateCase
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
      const body = await getCase(100);
      const article = body.article;
      body.OK.should.be.true;
      article.id.should.equal(100);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      const { req, res, ret } = getMocks({ body: example_case });
      await postCaseNewHttp(req, res);
      ret.body.OK.should.be.false;
    });
    it("fails without content", async () => {
      const { req, res, ret } = getMocksAuth({});
      await postCaseNewHttp(req, res);
      ret.body.OK.should.be.false;
    });
    it("works with authentication", async () => {
      const body = await addBasicCase();
      body.OK.should.be.true;
      let returnedCase = body.article;
      returnedCase.id.should.be.a("number");
      returnedCase.creator.user_id.should.equal(
        returnedCase.last_updated_by.user_id
      );
      // test key fields
      [
        "scope_of_influence",
        "public_spectrum",
        "legality",
        "facilitators",
        "facilitator_training",
        "facetoface_online_or_both",
        "open_limited",
        "recruitment_method",
        "time_limited"
      ].forEach(key => {
        returnedCase[key].should.equal(example_case[key]);
      });
      // test key list fields
      [
        "general_issues",
        "specific_topics",
        "purposes",
        "approaches",
        "targeted_participants",
        "method_types",
        "participants_interactions",
        "learning_resources",
        "decision_methods",
        "if_voting",
        "insights_outcomes",
        "organizer_types",
        "funder_types",
        "change_types",
        "implementers_of_change",
        "tools_techniques_types"
      ].forEach(key => {
        let ret = returnedCase[key];
        let exp = example_case[key];
        ret.length.should.equal(exp.length);
        for (var i = 0; i < ret.length; i++) {
          ret[i].should.equal(exp[i]);
        }
      });
      // test media fields
      [
        "files",
        "links",
        "videos",
        "audio",
        "photos",
        "evaluation_reports",
        "evaluation_links"
      ].forEach(key => {
        returnedCase[key].length.should.equal(example_case[key].length);
        for (let i = 0; i < returnedCase[key].length; i++) {
          let ret = returnedCase[key][i];
          let exp = example_case[key][i];
          expect(ret.attribution).to.equal(exp.attribution);
          expect(ret.title).to.equal(exp.title);
          expect(ret.url).to.equal(exp.url);
          if (exp.source_url) {
            expect(ret.source_url).to.equal(exp.source_url);
          }
        }
      });
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
      const body2 = await updateCase(origCase.id, {
        title: "Second Title",
        body: "Second Body",
        description: "Second Description"
      });
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
      origCase.general_issues[0].should.equal("arts");
      origCase.general_issues[1].should.equal("education");
      origCase.general_issues[2].should.equal("environment");
      origCase.general_issues[3].should.equal("planning");
      const updatedCase = (await updateCase(origCase.id, {
        general_issues: [{ key: "arts", value: "Arts, Culture, & Recreation" }]
      })).article;
      updatedCase.general_issues.length.should.equal(1);
      updatedCase.general_issues[0].should.equal("arts");
    });

    it("Add case, then modify lead image", async () => {
      const body1 = await addBasicCase();
      body1.OK.should.be.true;
      const case1 = body1.article;
      case1.photos.length.should.equal(3);
      case1.photos[0].url.should.equal(
        "https://s3.amazonaws.com/uploads.participedia.xyz/index.php__21.jpg"
      );
      const { req, res, ret } = getMocksAuth({
        params: { thingid: case1.id },
        body: {
          photos: [
            {
              url: "http://foobar.com/test.jpg",
              source_url: "https://example.com/foobar",
              title: "Right ho!",
              attribution: "Marie Osmond"
            }
          ]
        }
      });
      await postCaseUpdateHttp(req, res);
      const case2 = ret.body.article;
      case2.photos.length.should.equal(1);
      case2.photos[0].url.should.equal("http://foobar.com/test.jpg");
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
