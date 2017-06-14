const tokens = require("./setupenv"); // setupenv has to be imported before app
const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { addBasicCase } = require("./cases");
const chaiHelpers = require("./helpers");
const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe("Search", () => {
  describe("get first 20 cases", () => {
    it("finds 20 case titles and ids", async () => {
      const res = await chai
        .getJSON("/search/getAllForType?objType=case&page=1")
        .send({});
      res.should.have.status(200);
      should.equal(Object.keys(res.body).length, 20);
    });
  });
  describe("get first 20 methods", () => {
    it("finds 20 method titles and ids", async () => {
      const res = await chai
        .getJSON("/search/getAllForType?objType=method&page=1")
        .send({});
      res.should.have.status(200);
      should.equal(Object.keys(res.body).length, 20);
    });
  });
  describe("get first 20 organizations", () => {
    it("finds 20 organization titles and ids", async () => {
      const res = await chai
        .getJSON("/search/getAllForType?objType=organization&page=1")
        .send({});
      res.should.have.status(200);
      should.equal(Object.keys(res.body).length, 20);
    });
  });
  describe.skip("get organizations in Canada", () => {
    it("finds all Organizations with the term Canada", async () => {
      const res = await chai
        .getJSON("/search?query=Canada&selectedCategory=Organizations")
        .send({});
      res.should.have.status(200);
      res.body.OK.should.equal(true);
      res.body.results.should.have.lengthOf(17);
      res.body.results.forEach(obj => obj.type.should.equal("organization"));
    });
  });
  describe("get cases tagged 'nuclear'", () => {
    it("finds all Cases with the word nuclear", async () => {
      const res = await chai
        .getJSON("/search?query=nuclear&selectedCategory=Cases")
        .send({});
      res.should.have.status(200);
      res.body.OK.should.equal(true);
      res.body.results.should.have.lengthOf(3);
      res.body.results[0].type.should.equal("case");
    });
  });
  describe.skip("Test search with multi-word tags", () => {
    it("finds everything with the words animal welfare", async () => {
      const res = await chai.getJSON("/search?query=animal%20welfare").send({});
      res.should.have.status(200);
      res.body.OK.should.equal(true);
      res.body.results.should.have.lengthOf(2);
      // more testing
    });
  });
  describe("Test full-text search", () => {
    it("single-word search", async () => {
      const res = await chai.getJSON("/search?query=Budget").send({});
      res.should.have.status(200);
      res.body.results.should.have.lengthOf(20);
      const item = res.body.results[0];
      item.title.should.be.a("string");
      item.body.should.be.a("string");
      item.id.should.be.a("number");
      item.type.should.be.a("string");
      item.updated_date.should.be.a("string");
      item.bookmarked.should.be.a("boolean");
      item.should.have.property("lead_image");
    });
    it("multi-word search", async () => {
      const res = await chai
        .getJSON("/search?query=Budget%20Participatory")
        .send({});
      res.should.have.status(200);
      res.body.results.should.have.lengthOf(20);
    });
  });
  describe("Test cacheing", () => {
    it("Will only be correct if cache is cleared", async () => {
      const res1 = await chai.getJSON("/search").send({});
      res1.should.have.status(200);
      res1.body.results.should.have.lengthOf(20);
      const res2 = await addBasicCase();
      const theCase = res2.body.object;
      await chai
        .putJSON("/case/" + theCase.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ featured: true });
      const res3 = await chai.getJSON("/search").send({});
      // If the cache was cleared by adding and editing an object, the new object should
      // now be in the featured search results (the default search)
      const searchResultIds = res3.body.results.map(x => x.id);
      theCase.id.should.be.oneOf(searchResultIds);
    });
  });
});
