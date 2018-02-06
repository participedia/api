const tokens = require("./setupenv"); // setupenv has to be imported before app
const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { addBasicCase } = require("./cases");
const chaiHelpers = require("./helpers");
const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

async function setupIndividualFeatured(type, id) {
  await chai
    .putJSON(`/${type}/${id}`)
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      featured: true
    });
}

async function setupFeatured() {
  // make sure there are some featured articles
  await setupIndividualFeatured("case", 4557);
  await setupIndividualFeatured("case", 4554);
  await setupIndividualFeatured("case", 4548);
  await setupIndividualFeatured("method", 4546);
  await setupIndividualFeatured("organization", 4540);
}

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
  describe("confirm query tokenizing", () => {
    let { tokenize } = require("../api/helpers/search");
    it("simple and", () => {
      [...tokenize("first and second")].should.deep.equal([
        "",
        "first",
        "&",
        "",
        "second"
      ]);
    });
    it("simple or", () => {
      [...tokenize("first or second")].should.deep.equal([
        "",
        "first",
        "|",
        "",
        "second"
      ]);
    });
    it("simple not", () => {
      [...tokenize("first not second")].should.deep.equal([
        "",
        "first",
        "&",
        "!",
        "",
        "second"
      ]);
    });
    it("parentheses", () => {
      [...tokenize("first or (second and third)")].should.deep.equal([
        "",
        "first",
        "|",
        "",
        "(",
        "",
        "second",
        "&",
        "",
        "third",
        ")"
      ]);
    });
    it("quoted string", () => {
      [...tokenize('first and "second third"')].should.deep.equal([
        "",
        "first",
        "&",
        "",
        "",
        "second",
        "<->",
        "third"
      ]);
    });
    it("handle whitespace", () => {
      [...tokenize('first second "third fourth" fifth')].should.deep.equal([
        "",
        "first",
        "&",
        "second",
        "&",
        "",
        "third",
        "<->",
        "fourth",
        "&",
        "fifth"
      ]);
    });
    it("drop punctuation, etc.", () => {
      [
        ...tokenize("first 123, inject's some ;drop table *bs")
      ].should.deep.equal([
        "",
        "first",
        "&",
        "inject",
        "&",
        "s",
        "&",
        "some",
        "&",
        "drop",
        "&",
        "table",
        "&",
        "bs"
      ]);
    });
    it("complex query", () => {
      [
        ...tokenize('first and (second or third) and ("fourth fifth" or sixth)')
      ].should.deep.equal([
        "",
        "first",
        "&",
        "",
        "(",
        "",
        "second",
        "|",
        "",
        "third",
        ")",
        "&",
        "",
        "(",
        "",
        "",
        "fourth",
        "<->",
        "fifth",
        "|",
        "",
        "sixth",
        ")"
      ]);
    });
  });
  describe("confirm query parsing", () => {
    let { preparse_query } = require("../api/helpers/search");
    it("simple and", () => {
      preparse_query("first and second").should.equal("first&second");
    });
    it("simple or", () => {
      preparse_query("first or second").should.equal("first|second");
    });
    it("simple not", () => {
      preparse_query("first not second").should.equal("first&!second");
    });
    it("parentheses", () => {
      preparse_query("first or (second and third)").should.equal(
        "first|(second&third)"
      );
    });
    it("quoted string", () => {
      preparse_query('first and "second third"').should.equal(
        "first&second<->third"
      );
    });
    it("handle whitespace", () => {
      preparse_query('first second "third fourth" fifth').should.equal(
        "first&second&third<->fourth&fifth"
      );
    });
    it("drop punctuation, etc.", () => {
      preparse_query("first 123, inject's some ;drop table *bs").should.equal(
        "first&inject&s&some&drop&table&bs"
      );
    });
    it("complex query", () => {
      preparse_query(
        'first and (second or third) and ("fourth fifth" or sixth)'
      ).should.equal("first&(second|third)&(fourth<->fifth|sixth)");
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
  describe("get organizations in Canada", () => {
    it("finds all Organizations with the term Canada", async () => {
      const res = await chai
        .getJSON("/search?query=Canada&selectedCategory=Organizations")
        .send({});
      res.should.have.status(200);
      res.body.OK.should.equal(true);
      res.body.results.should.have.lengthOf(20);
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
      res.body.results[0].type.should.equal("case");
    });
  });
  describe("Test search with multi-word tags", () => {
    it("finds everything with the words animal welfare", async () => {
      const res = await chai.getJSON("/search?query=animal%20welfare").send({});
      res.should.have.status(200);
      res.body.OK.should.equal(true);
      res.body.results.should.have.lengthOf(6);
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
      item.should.have.property("images");
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
      // reset so we don't throw off later tests
      await chai
        .putJSON("/case/" + theCase.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ featured: false });
    });
  });
  describe("Test hidden results", () => {
    it("Hiding an element removes it from featured (default) search", async () => {
      const res1 = await chai.getJSON("/search").send({});
      res1.should.have.status(200);
      res1.should.be.json;
      res1.body.results.should.have.lengthOf(20);
      const res2 = await addBasicCase();
      const theCase = res2.body.object;
      await chai
        .putJSON("/case/" + theCase.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ featured: true });
      const res3 = await chai.getJSON("/search").send({});
      const searchResultIds = res3.body.results.map(x => x.id);
      theCase.id.should.be.oneOf(searchResultIds);
      await chai
        .putJSON("/case/" + theCase.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ hidden: true });
      const res4 = await chai.getJSON("/search").send({});
      const searchResultIds2 = res4.body.results.map(x => x.id);
      theCase.id.should.not.be.oneOf(searchResultIds2);
    });
  });
  describe("Test resultType=map", () => {
    it("setup", setupFeatured);
    it("find featured results", async () => {
      const res = await chai.getJSON("/search?resultType=map").send({});
      res.should.have.status(200);
      res.body.results
        .filter(result => result.searchmatched)
        .should.have.lengthOf.at.least(5);
      let len = res.body.results.filter(result => result.searchmatched).length;
      res.body.results
        .filter(result => result.featured)
        .should.have.lengthOf(len);
    });
    it("find featured cases", async () => {
      const res = await chai
        .getJSON("/search?resultType=map&selectedCategory=Cases")
        .send({});
      res.should.have.status(200);
      res.body.results
        .filter(result => result.searchmatched)
        .should.have.lengthOf.at.least(3);
      let len = res.body.results.filter(result => result.searchmatched).length;
      res.body.results
        .filter(result => result.featured && result.type === "case")
        .should.have.lengthOf(len);
    });
    it("find queried articles", async () => {
      const res = await chai
        .getJSON("/search?resultType=map&query=fraud")
        .send();
      res.should.have.status(200);
    });
    it("find queried cases", async () => {
      const res = await chai
        .getJSON("/search?resultType=map&query=fraud&selectedCategory=Cases")
        .send();
      res.should.have.status(200);
    });
  });
});
