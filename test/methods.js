let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_method,
  getMethod,
  addBasicMethod,
  updateMethod
} = require("./data/helpers.js");
const {
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp
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
      try {
        await postMethodNewHttp(req, res);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const { req, res, ret } = getMocksAuth({});
        await postMethodNewHttp(req, res);
        fail();
      } catch (err) {
        console.error("Error: %s", err);
      }
    });
    it("works with authentication", async () => {
      const body = await addBasicMethod();
      body.OK.should.be.true;
      const article = body.article;
      article.id.should.be.a("number");
      article.links.should.have.lengthOf(1);
      article.links[0].url.should.equal("https://killsixbilliondemons.com/");
    });
  });
  describe("Test edit API", () => {
    it("Add method, then modify title and/or body", async () => {
      const body1 = await addBasicMethod();
      body1.OK.should.be.true;
      const origMethod = body1.article;
      origMethod.id.should.be.a("number");
      const body2 = await updateMethod(origMethod.id, {
        title: "Second Title"
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
        body: "Third Body"
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
        photos: [{ url: "http://garfield.com/jon.png" }]
      });
      body2.OK.should.be.true;
      should.exist(body2.article);
      const method2 = body2.article;
      method2.photos[0].url.should.equal("http://garfield.com/jon.png");
      expect(method2.updated_date > method1.updated_date).to.be.true;
      const photos = [method1.photos[0]];
      photos.push(method2.photos[0]);
      photos.push({ url: "https://wonderwall.com/howzaboutthemjpegs.png" });
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
        { url: "https://xkcd.com/" },
        { url: "http://girlgeniusonline.com/" }
      ];
      const method2 = (await updateMethod(method1.id, {
        title: "Second Title",
        body: "Second Body",
        description: "Second Description",
        links: links
      })).article;
      method2.links[0].url.should.equal(links[0].url);
      method2.links[1].url.should.equal(links[1].url);
    });
  });
});
