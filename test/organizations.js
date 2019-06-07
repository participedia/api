let chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const {
  getMocks,
  getMocksAuth,
  example_organization,
  getOrganization,
  addBasicOrganization,
  updateOrganization
} = require("./data/helpers.js");
const {
  getOrganizationHttp,
  getOrganizationEditHttp,
  postOrganizationNewHttp,
  getOrganizationNewHttp,
  postOrganizationUpdateHttp
} = require("../api/controllers/organization");

describe("Organizations", () => {
  describe("Lookup", () => {
    it("finds organization 307", async () => {
      const { req, res, ret } = getMocks({ params: { thingid: 307 } });
      await getOrganizationHttp(req, res);
      const article = ret.body.article;
      ret.body.OK.should.be.true;
      article.id.should.equal(307);
    });
  });

  describe("Adding", () => {
    it("fails without authentication", async () => {
      const { req, res, ret } = getMocks({ body: example_organization });
      await postOrganizationNewHttp(req, res);
      ret.body.OK.should.be.false;
    });
    it("fails without content", async () => {
      const { req, res, ret } = getMocksAuth({});
      await postOrganizationNewHttp(req, res);
      console.log("ret: %s", JSON.stringify(ret, null, 2));
      ret.body.OK.should.be.false;
    });
    it("works with authentication", async () => {
      const body = await addBasicOrganization();
      body.OK.should.be.true;
      const article = body.article;
      article.id.should.be.a("number");
      article.links.should.have.lengthOf(1);
      article.links[0].url.should.equal("https://killsixbilliondemons.com/");
    });
  });
  describe("Test edit API", () => {
    it("Add organization, then modify title and/or body", async () => {
      const body1 = await addBasicOrganization();
      body1.OK.should.be.true;
      const origOrganization = body1.article;
      origOrganization.id.should.be.a("number");
      const body2 = await updateOrganization(origOrganization.id, {
        title: "Second Title"
      });
      const updatedOrganization1 = body2.article;
      updatedOrganization1.title.should.equal("Second Title");
      updatedOrganization1.body.should.equal("First Body");
      const body3 = await updateOrganization(origOrganization.id, {
        body: "Second Body"
      });
      const updatedOrganization2 = body3.article;
      updatedOrganization2.title.should.equal("Second Title");
      updatedOrganization2.body.should.equal("Second Body");
    });
    it("Add organization, then modify lead image", async () => {
      const body1 = await addBasicOrganization();
      body1.OK.should.be.true;
      const organization1 = body1.article;
      organization1.photos[0].url.should.equal(
        "http://example.com/picture.jpg"
      );
      const body2 = await updateOrganization(organization1.id, {
        photos: [
          {
            url: "http://garfield.com/jon.png",
            source_url: "https://example.com/obligatory_plug",
            title: "In Ned Flanders Field",
            attribution: "Birt Sampson"
          }
        ]
      });
      body2.OK.should.be.true;
      const organization2 = body2.article;
      organization2.photos[0].url.should.equal("http://garfield.com/jon.png");
      expect(organization2.updated_date > organization1.updated_date).to.be
        .true;
    });
    it.skip("Try to change featured flag", async () => {
      const res1 = await addBasicOrganization();
      const organization1 = res1.body.object;
      organization1.featured.should.be.false;
      const res2 = await chai
        .putJSON("/organization/" + organization1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ featured: true });
      const organization2 = res2.body.data;
      organization2.featured.should.be.true;
    });
  });
});
