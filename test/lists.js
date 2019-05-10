let tokens = require("./setupenv"); // setupenv has to be imported before app
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
const { titleKeys, shortKeys } = require("../api/helpers/things");
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe("Lists", () => {
  describe("basics", () => {
    it("Get all the titles", async () => {
      const res = await chai.getJSON("/list/titles").send({});
      res.should.have.status(200);
      res.body.OK.should.be.true;
      const result = res.body.data;
      result.should.have.all.keys(["cases", "methods", "organizations"]);
      should.exist(result.cases[598]);
      should.exist(result.methods[147]);
      should.exist(result.organizations[426]);
      const theCase = result.cases[0];
      theCase.should.have.all.keys(titleKeys);
    });
    it("Get all the short objects", async () => {
      const res = await chai.getJSON("/list/short").send({});
      res.should.have.status(200);
      const result = res.body.data;
      should.exist(result.cases[598]);
      should.exist(result.methods[147]);
      should.exist(result.organizations[426]);
      const theCase = result.cases[0];
      theCase.should.have.all.keys(shortKeys);
    });
  });
});
