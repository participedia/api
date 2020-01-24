let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_method,
  getMethod,
  addBasicMethod,
  updateMethod,
} = require("./data/helpers.js");
const {
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp,
} = require("../api/controllers/method");

describe("Methods", () => {
  describe("Lookup", () => {
    it("finds method 190", async () => {
      const { req, res, ret } = getMocks({ params: { thingid: 190 } });
      await getMethodHttp(req, res);
      const article = ret.body.article;
      ret.body.OK.should.be.true;
      article.id.should.equal(190);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      const { req, res, ret } = getMocks({ body: example_method });
      await postMethodNewHttp(req, res);
      ret.body.OK.should.be.false;
      // ret.body.status.should.equal(400);
    });
    it("fails without content", async () => {
      const { req, res, ret } = getMocksAuth({});
      await postMethodNewHttp(req, res);
      ret.body.OK.should.be.false;
      // ret.status.should.equal(400);
    });
    it("works with authentication", async () => {
      const body = await addBasicMethod();
      body.OK.should.be.true;
      const article = body.article;
      article.id.should.be.a("number");
      article.creator.user_id.should.equal(article.last_updated_by.user_id);
      // test key fields
      [
        "facilitators",
        "facetoface_online_or_both",
        "public_spectrum",
        "open_limited",
        "recruitment_method",
        "level_polarization",
        "level_complexity",
      ].forEach(key => {
        expect(
          article[key],
          `expected ${key} to equal "${example_method[key]}", but got "${
            article[key]
          }"`
        ).to.equal(example_method[key]);
      });
      // test key list fields
      [
        "method_types",
        "scope_of_influence",
        "participants_interactions",
        "number_of_participants",
        "decision_methods",
        "if_voting",
        "number_of_participants",
        "purpose_method",
      ].forEach(key => {
        let ret = article[key];
        let exp = example_method[key];
        ret.length.should.equal(exp.length);
        for (var i = 0; i < ret.length; i++) {
          expect(ret[i], `for key ${key} and index ${i}`).to.equal(exp[i]);
        }
      });
      // test media fields
      ["files", "links", "videos", "audio", "photos"].forEach(key => {
        article[key].length.should.equal(example_method[key].length);
        for (let i = 0; i < article[key].length; i++) {
          let ret = article[key][i];
          let exp = example_method[key][i];
          expect(ret.attribution, `for key ${key} and index ${i}`).to.equal(
            exp.attribution
          );
          expect(ret.title, `for key ${key} and index ${i}`).to.equal(
            exp.title
          );
          expect(ret.url, `for key ${key} and index ${i}`).to.equal(exp.url);
          if (exp.source_url) {
            expect(ret.source_url, `for key ${key} and index ${i}`).to.equal(
              exp.source_url
            );
          }
        }
      });
    });
  });
  describe("Test edit API", () => {
    it("Add method, then modify title and/or body", async () => {
      const body1 = await addBasicMethod();
      body1.OK.should.be.true;
      const origMethod = body1.article;
      origMethod.id.should.be.a("number");
      const body2 = await updateMethod(origMethod.id, {
        title: "Second Title",
      });
      const updatedMethod1 = body2.article;
      updatedMethod1.title.should.equal("Second Title");
      updatedMethod1.body.should.equal("First Body");
      const body3 = await updateMethod(origMethod.id, { body: "Second Body" });
      const updatedMethod2 = body3.article;
      updatedMethod2.title.should.equal("Second Title");
      updatedMethod2.body.should.equal("Second Body");
      const body4 = await updateMethod(origMethod.id, {
        title: "Third Title",
        body: "Third Body",
      });
      const updatedMethod3 = body4.article;
      updatedMethod3.title.should.equal("Third Title");
      updatedMethod3.body.should.equal("Third Body");
    });
    it("Add method, then modify lead image", async () => {
      const body1 = await addBasicMethod();
      body1.OK.should.be.true;
      const method1 = body1.article;
      method1.photos[0].url.should.equal("http://example.com/picture.jpg");
      const body2 = await updateMethod(method1.id, {
        photos: [
          {
            url: "http://garfield.com/jon.png",
            source_url: "https://example.com/garfields_tomb",
            title: "Jon lays a wreath",
            attribution: "Cleveland Plain Dealer",
          },
        ],
      });
      body2.OK.should.be.true;
      should.exist(body2.article);
      const method2 = body2.article;
      method2.photos[0].url.should.equal("http://garfield.com/jon.png");
      expect(method2.updated_date > method1.updated_date).to.be.true;
      const photos = [method1.photos[0]];
      photos.push(method2.photos[0]);
      photos.push({
        url: "https://wonderwall.com/howzaboutthemjpegs.png",
        source_url: "https://example.com/ugh",
        attribution: "The Red Menace",
        title: "Whatever",
      });
      const body3 = await updateMethod(method1.id, { photos: photos });
      body3.OK.should.be.true;
      const method3 = body3.article;
      method3.photos[2].url.should.equal(
        "https://wonderwall.com/howzaboutthemjpegs.png"
      );
    });
    it("Add method, then change links", async () => {
      const method1 = (await addBasicMethod()).article;
      const links = [
        {
          url: "https://xkcd.com/",
          title: "xkcd",
          attribution: "Randall Monroe",
        },
        {
          url: "http://girlgeniusonline.com/",
          title: "Girl Genius",
          attribution: "Professors Foglio",
        },
      ];
      const method2 = (await updateMethod(method1.id, {
        title: "Second Title",
        body: "Second Body",
        description: "Second Description",
        links: links,
      })).article;
      method2.links[0].url.should.equal(links[0].url);
      method2.links[1].url.should.equal(links[1].url);
    });
  });
});
