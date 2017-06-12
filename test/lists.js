let tokens = require("./setupenv"); // setupenv has to be imported before app
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

// Define the keys we're testing (move these to helper/things.js ?
const titleKeys = ["id", "title"];
const shortKeys = titleKeys.concat([
  "type",
  "lead_image",
  "post_date",
  "updated_date"
]);
const medKeys = shortKeys.concat(["body", "bookmarked", "location"]);
const thingKeys = medKeys.concat([
  "original_language",
  "published",
  "other_images",
  "files",
  "videos",
  "featured",
  "tags",
  "url"
]);
const caseKeys = thingKeys.concat([
  "issue",
  "communication_mode",
  "communication_with_audience",
  "content_country",
  "decision_method",
  "end_date",
  "facetoface_online_or_both",
  "facilitated",
  "voting",
  "number_of_meeting_days",
  "ongoing",
  "start_date",
  "total_number_of_participants",
  "targeted_participant_demographic",
  "kind_of_influence",
  "targeted_participants_public_role",
  "targeted_audience",
  "participant_selection",
  "specific_topic",
  "staff_type",
  "type_of_funding_entity",
  "typical_implementing_entity",
  "typical_sponsoring_entity",
  "who_else_supported_the_initiative",
  "who_was_primarily_responsible_for_organizing_the_initiative"
]);
const methodKeys = thingKeys.concat([
  "best_for",
  "communication_mode",
  "decision_mode",
  "facilitated",
  "governance_contribution",
  "issue_interdependency",
  "issue_polarization",
  "issue_technical_complexity",
  "kind_of_influence",
  "method_of_interaction",
  "public_interaction_method",
  "typical_funding_source",
  "typical_implementing_entity",
  "typical_sponsoring_entity"
]);
const organizationKeys = thingKeys.concat([
  "executive_director",
  "issue",
  "sector"
]);

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
    it.skip("Get all the medium objects", async () => {
      const res = await chai.getJSON("/list/medium").send({});
      res.should.have.status(200);
      const result = res.body.data;
      result.cases.should.have.lenthOf.at.least(599);
      result.methods.should.have.lengthOf.at.least(148);
      result.organizations.should.have.lengthOf.at.least(427);
      const theCase = result.cases[0];
      theCase.should.have.all.keys(mediumKeys);
    });
  });
});
