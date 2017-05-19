let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

async function addBasicOrganization() {
  return chai
    .postJSON("/organization/new")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      // mandatory
      title: "First Title",
      body: "First Body",
      // optional
      lead_image: "https://images-na.ssl-images-amazon.com/images/I/91-KWP5kiJL.jpg",
      vidURL: "https://www.youtube.com/watch?v=ZPoqNeR3_UA&t=11050s",
      related_cases: [9, 10, 11, 12],
      related_methods: [151, 152, 153],
      related_organizations: [205, 206, 207]
    });
}

describe("Organizations", () => {
  describe("Lookup", () => {
    it("finds organization 307", async () => {
      const res = await chai.getJSON("/organization/307").send({});
      res.should.have.status(200);
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/organization/new").send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/organization/new")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await chai
        .postJSON("/organization/new")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "Up the organization",
          body: "Guerilla Marketing",
          // optional
          vidURL: "https://www.youtube.com/watch?v=KVc6rywClWk&t=2078s",
          related_cases: []
        });
      res.should.have.status(201);
    });
  });
  describe("Get organization with tags", () => {
    it("should have 5 tags", async () => {
      const res = await chai.getJSON("/organization/212").send({});
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let the_organization = res.body.data;
      the_organization.tags.should.have.lengthOf(5);
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", async () => {
      const res = await chai.getJSON("/organization/268").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(0);
      res.body.data.related_methods.should.have.lengthOf(0);
      res.body.data.related_organizations.should.have.lengthOf(0);
    });
    it("test related objects with single item", async () => {
      const res = await chai.getJSON("/organization/269").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(1);
      res.body.data.related_cases[0].id.should.equal(66);
      res.body.data.related_methods.should.have.lengthOf(1);
      res.body.data.related_methods[0].id.should.equal(166);
      res.body.data.related_organizations.should.have.lengthOf(1);
      res.body.data.related_organizations[0].id.should.equal(266);
    });
    it("test related objects with multiple items", async () => {
      const res = await chai.getJSON("/organization/270").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(3);
      res.body.data.related_methods.should.have.lengthOf(2);
      res.body.data.related_organizations.should.have.lengthOf(2);
    });
  });
  describe("Test edit API", () => {
    it("Add organization, then null modify it", async () => {
      const res1 = await addBasicOrganization();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.organization_id.should.be.a("number");
      const origOrganization = res1.body.object;
      origOrganization.id.should.be.a("number");
      origOrganization.id.should.equal(res1.body.data.organization_id);
      const res2 = await chai
        .putJSON("/organization/" + res1.body.data.organization_id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({}); // empty update
      res2.should.have.status(200);
      const updatedOrganization1 = res2.body.data;
      updatedOrganization1.should.deep.equal(origOrganization); // no changes saved
    });
    it("Add organization, then modify title and/or body", async () => {
      const res1 = await addBasicOrganization();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.organization_id.should.be.a("number");
      const origOrganization = res1.body.object;
      origOrganization.id.should.be.a("number");
      origOrganization.id.should.equal(res1.body.data.organization_id);
      const res2 = await chai
        .putJSON("/organization/" + res1.body.data.organization_id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Second Title" }); // empty update
      res2.should.have.status(200);
      const updatedOrganization1 = res2.body.data;
      updatedOrganization1.title.should.equal("Second Title");
      updatedOrganization1.body.should.equal("First Body");
      const res3 = await chai
        .putJSON("/organization/" + res1.body.data.organization_id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ body: "Second Body" }); // empty update
      res3.should.have.status(200);
      const updatedOrganization2 = res3.body.data;
      updatedOrganization2.title.should.equal("Second Title");
      updatedOrganization2.body.should.equal("Second Body");
      const res4 = await chai
        .putJSON("/organization/" + res1.body.data.organization_id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Third Title", body: "Third Body" }); // empty update
      res4.should.have.status(200);
      const updatedOrganization3 = res4.body.data;
      updatedOrganization3.title.should.equal("Third Title");
      updatedOrganization3.body.should.equal("Third Body");
      updatedOrganization3.authors.length.should.equal(
        updatedOrganization2.authors.length + 1
      );
    });
    it("Add organization, then modify lead image", async () => {
      const res1 = await addBasicOrganization();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const organization1 = res1.body.object;
      organization1.lead_image.url.should.equal("CitizensAssembly_2.jpg");
      const res2 = await chai
        .putJSON("/organization/" + organization1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ lead_image: { url: "foobar.jpg", title: "" } });
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      should.exist(res2.body.data);
      const organization2 = res2.body.data;
      organization2.lead_image.url.should.equal("foobar.jpg");
      organization2.updated_date.should.be.above(organization1.updated_date);
      const res3 = await chai
        .putJSON("/organization/" + organization1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          lead_image: {
            url: "howzaboutthemjpegs.png",
            title: "Innocuous Title"
          }
        });
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const organization3 = res3.body.data;
      organization3.lead_image.url.should.equal("howzaboutthemjpegs.png");
      organization3.lead_image.title.should.equal("Innocuous Title");
    });
    it("Add organization, then change related objects", async () => {
      const res1 = await addBasicOrganization();
      const organization1 = res1.body.object;
      organization1.related_cases.should.have.lengthOf(4);
      organization1.related_cases
        .map(x => x.id)
        .should.deep.equal([1, 2, 3, 4]);
      const related_cases = organization1.related_cases.slice();
      related_cases.shift(); // remove first one
      related_cases.push({ id: 5 }, { id: 6 });
      const res2 = await chai
        .putJSON("/organization/" + organization1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ related_cases });
      const organization2 = res2.body.data;
      organization2.related_cases
        .map(x => x.id)
        .should.deep.equal([2, 3, 4, 5, 6]);
      // test bidirectionality
      const res3 = await chai.getJSON("/organization/6").send({});
      const organization3 = res3.body.data;
      organization3.related_cases
        .map(x => x.id)
        .should.include(organization1.id);
    });
  });
});
