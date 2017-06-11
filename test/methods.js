let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
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
      lead_image: "https://cdn.thinglink.me/api/image/756598547733807104/",
      vidURL: "https://www.youtube.com/watch?v=ZPoqNeR3_UA&t=11050s",
      related_cases: [5, 6, 7, 8],
      related_methods: [148, 149, 150],
      related_organizations: [202, 203, 204],
      tags: ["OIDP2017", "Tag1", "Tag2"],
      links: ["http://killsixbilliondemons.com/", "http://dresdencodak.com/"]
    });
}

async function setupRelatedObjectsSingle() {
  // setup relations with exactly one item
  await chai
    .putJSON("/method/162")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      related_cases: [{ id: 65 }],
      related_methods: [{ id: 165 }],
      related_organizations: [{ id: 265 }]
    });
}

async function setupRelatedObjectsMultiple() {
  // setup relations with multiple items
  await chai
    .putJSON("/method/161")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      related_cases: [{ id: 47 }, { id: 52 }],
      related_methods: [{ id: 147 }, { id: 152 }],
      related_organizations: [{ id: 247 }, { id: 252 }]
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
      returnedMethod.related_cases.length.should.equal(4);
      returnedMethod.related_methods.length.should.equal(3);
      returnedMethod.related_organizations.length.should.equal(3);
      returnedMethod.links.should.have.lengthOf(2);
      returnedMethod.tags.should.have.lengthOf(3);
      returnedMethod.links.should.deep.equal([
        "http://killsixbilliondemons.com/",
        "http://dresdencodak.com/"
      ]);
      returnedMethod.tags.should.deep.equal(["OIDP2017", "Tag1", "Tag2"]);
    });
  });
  describe("Get method with tags", () => {
    it("should have 7 tags", async () => {
      const res = await chai.getJSON("/method/428").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let the_method = res.body.data;
      the_method.tags.should.have.lengthOf(7);
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", async () => {
      const res = await chai.getJSON("/method/172").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(0);
      res.body.data.related_methods.should.have.lengthOf(0);
      res.body.data.related_organizations.should.have.lengthOf(0);
    });
    it("test related objects with single item", async () => {
      await setupRelatedObjectsSingle();
      const res = await chai.getJSON("/method/162").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(1);
      res.body.data.related_cases[0].id.should.equal(65);
      res.body.data.related_methods.should.have.lengthOf(1);
      res.body.data.related_methods[0].id.should.equal(165);
      res.body.data.related_organizations.should.have.lengthOf(1);
      res.body.data.related_organizations[0].id.should.equal(265);
    });
    it("test related objects with multiple items", async () => {
      await setupRelatedObjectsMultiple();
      const res = await chai.getJSON("/method/161").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(2);
      res.body.data.related_cases[0].id.should.equal(47);
      res.body.data.related_cases[1].id.should.equal(52);
      res.body.data.related_methods.should.have.lengthOf(2);
      res.body.data.related_methods[0].id.should.equal(147);
      res.body.data.related_methods[1].id.should.equal(152);
      res.body.data.related_organizations.should.have.lengthOf(2);
      res.body.data.related_organizations[0].id.should.equal(247);
      res.body.data.related_organizations[1].id.should.equal(252);
    });
  });
  describe("Test edit API", () => {
    it("Add method, then null modify it", async () => {
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
        .send({}); // empty update
      res2.should.have.status(200);
      const updatedMethod1 = res2.body.data;
      updatedMethod1.should.deep.equal(origMethod); // no changes saved
    });
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
      updatedMethod3.authors.length.should.equal(
        updatedMethod2.authors.length + 1
      );
    });
    it("Add method, then modify lead image", async () => {
      const res1 = await addBasicMethod();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const method1 = res1.body.object;
      method1.lead_image.url.should.equal(
        "https://cdn.thinglink.me/api/image/756598547733807104/"
      );
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ lead_image: { url: "foobar.jpg", title: "" } });
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      should.exist(res2.body.data);
      const method2 = res2.body.data;
      method2.lead_image.url.should.equal("foobar.jpg");
      method2.updated_date.should.be.above(method1.updated_date);
      const res3 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          lead_image: {
            url: "howzaboutthemjpegs.png",
            title: "Innocuous Title"
          }
        });
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const method3 = res3.body.data;
      method3.lead_image.url.should.equal("howzaboutthemjpegs.png");
      method3.lead_image.title.should.equal("Innocuous Title");
    });
    it("Add method, then change related objects", async () => {
      const res1 = await addBasicMethod();
      const method1 = res1.body.object;
      method1.related_cases.should.have.lengthOf(4);
      method1.related_cases.map(x => x.id).should.deep.equal([5, 6, 7, 8]);
      const related_cases = method1.related_cases.slice();
      related_cases.shift(); // remove first one
      related_cases.push({ id: 9 }, { id: 10 });
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ related_cases });
      const method2 = res2.body.data;
      method2.related_cases.map(x => x.id).should.deep.equal([6, 7, 8, 9, 10]);
      // test bidirectionality
      const res3 = await chai.getJSON("/case/8").send({});
      const method3 = res3.body.data;
      method3.related_methods.map(x => x.id).should.include(method1.id);
    });
    it("Add method, then change tags", async () => {
      const res1 = await addBasicMethod();
      const method1 = res1.body.object;
      const tags = ["foo", "bar"];
      const res2 = await chai
        .putJSON("/method/" + method1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ tags });
      const res3 = await chai.getJSON("/method/" + method1.id).send({});
      const method1_new = res3.body.data;
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
