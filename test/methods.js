let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
let expect = chai.expect;
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

async function addBasicMethod() {
  return chai
    .postJSON("/method/new")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      // mandatory
      title: "First Title",
      body: "First Body",
      // optional
      images: ["https://cdn.thinglink.me/api/image/756598547733807104/"],
      vidURL: "https://www.youtube.com/watch?v=ZPoqNeR3_UA&t=11050s",
      tags: ["OIDP2017", "Tag1", "Tag2"],
      links: ["http://killsixbilliondemons.com/", "http://dresdencodak.com/"]
    });
}

describe("Methods", () => {
  describe("Lookup", () => {
    it("finds method 190", async () => {
      const res = await chai.getJSON("/method/190").send({});
      res.should.have.status(200);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/method/new").send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/method/new")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await addBasicMethod();
      res.should.have.status(201);
      res.body.OK.should.be.true;
      res.body.data.thingid.should.be.a("number");
      let returnedMethod = res.body.object;
      returnedMethod.links.should.have.lengthOf(2);
      returnedMethod.tags.should.have.lengthOf(3);
      returnedMethod.links.should.deep.equal([
        "http://killsixbilliondemons.com/",
        "http://dresdencodak.com/"
      ]);
      returnedMethod.tags.should.deep.equal(["OIDP2017", "Tag1", "Tag2"]);
    });
  });
  describe("Test edit API", () => {
    it("Add method, then modify title and/or body", async () => {
      const res1 = await addBasicMethod();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origMethod = res1.body.object;
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
      updatedMethod3.authors.length.should.equal(updatedMethod2.authors.length);
    });
    it("Add method, then modify lead image", async () => {
      const res1 = await addBasicMethod();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const method1 = res1.body.object;
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
      const res1 = await addBasicMethod();
      const method1 = res1.body.object;
      const links = ["https://xkcd.com/", "http://girlgeniusonline.com/"];
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ links });
      const method1_new = res2.body.data;
      method1_new.links.should.deep.equal(links);
    });
  });
});
