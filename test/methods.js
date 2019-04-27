let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_method,
  addBasicMethod
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
    it.only("works with authentication", async () => {
      const body = await addBasicMethod();
      body.OK.should.be.true;
      const article = body.article;
      article.id.should.be.a("number");
      article.links.should.have.lengthOf(1);
      article.tags.should.have.lengthOf(2);
      article.links[0].url.should.equal("http://killsixbilliondemons.com/");
      returnedMethod.tags.should.deep.equal(["first", "tag"]);
    });
  });
  describe("Test edit API", () => {
    it("Add method, then modify title and/or body", async () => {
      const res1 = await addBasicMethod();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origMethod = res1.body.article;
      origMethod.id.should.be.a("number");
      origMethod.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/method/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Second Title" }); // empty update
      res2.should.have.status(200);
      const updatedMethod1 = res2.body.data;
      updatedMethod1.title.should.equal("Second Title");
      updatedMethod1.body.should.equal("First Body");
      const res3 = await chai
        .putJSON("/method/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ body: "Second Body" }); // empty update
      res3.should.have.status(200);
      const updatedMethod2 = res3.body.data;
      updatedMethod2.title.should.equal("Second Title");
      updatedMethod2.body.should.equal("Second Body");
      const res4 = await chai
        .putJSON("/method/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Third Title", body: "Third Body" }); // empty update
      res4.should.have.status(200);
      const updatedMethod3 = res4.body.data;
      updatedMethod3.title.should.equal("Third Title");
      updatedMethod3.body.should.equal("Third Body");
    });
    it("Add method, then modify lead image", async () => {
      const res1 = await addBasicMethod();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const method1 = res1.body.article;
      method1.images.should.deep.equal([
        "https://cdn.thinglink.me/api/image/756598547733807104/"
      ]);
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ images: ["foobar.jpg"] });
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      should.exist(res2.body.data);
      const method2 = res2.body.data;
      method2.images.should.deep.equal(["foobar.jpg"]);
      expect(method2.updated_date > method1.updated_date).to.be.true;
      const res3 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ images: ["howzaboutthemjpegs.png"] });
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const method3 = res3.body.data;
      method3.images.should.deep.equal(["howzaboutthemjpegs.png"]);
    });
    it("Add method, then change tags", async () => {
      const res1 = await addBasicMethod();
      const method1 = res1.body.object;
      const tags = ["foo", "bar"];
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ tags });
      const method1_new = res2.body.data;
      method1_new.tags.should.deep.equal(tags);
    });
    it("Add method, then change links", async () => {
      const method1 = (await addBasicMethod()).article;
      const links = [
        { url: "https://xkcd.com/" },
        { url: "http://girlgeniusonline.com/" }
      ];
      const { req, res, ret } = getMocksAuth({
        params: { thingid: method1.id },
        body: {
          title: "Second Title",
          body: "Second Body",
          description: "Second Description"
        }
      });
      await postCaseUpdateHttp(req, res);

      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ links });
      const method1_new = res2.body.data;
      method1_new.links.should.deep.equal(links);
    });
  });
});
