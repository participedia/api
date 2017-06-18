let tokens = require("./setupenv");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

let location = {
  label: "Cleveland, OH, United States",
  placeId: "ChIJLWto4y7vMIgRQhhi91XLBO0",
  isFixture: false,
  gmaps: {
    address_components: [
      {
        long_name: "Cleveland",
        short_name: "Cleveland",
        types: ["locality", "political"]
      },
      {
        long_name: "Cuyahoga County",
        short_name: "Cuyahoga County",
        types: ["administrative_area_level_2", "political"]
      },
      {
        long_name: "Ohio",
        short_name: "OH",
        types: ["administrative_area_level_1", "political"]
      },
      {
        long_name: "United States",
        short_name: "US",
        types: ["country", "political"]
      }
    ],
    formatted_address: "Cleveland, OH, USA",
    geometry: {
      bounds: {
        south: 41.390628,
        west: -81.87897599999997,
        north: 41.604436,
        east: -81.53274390000001
      },
      location: {
        lat: 41.49932,
        lng: -81.69436050000002
      },
      location_type: "APPROXIMATE",
      viewport: {
        south: 41.390628,
        west: -81.87897599999997,
        north: 41.5992571,
        east: -81.53274390000001
      }
    },
    place_id: "ChIJLWto4y7vMIgRQhhi91XLBO0",
    types: ["locality", "political"]
  },
  location: {
    lat: 41.49932,
    lng: -81.69436050000002
  }
};

async function addBasicCase() {
  return chai
    .postJSON("/case/new")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      // mandatory
      title: "First Title",
      body: "First Body",
      // optional
      lead_image: "CitizensAssembly_2.jpg", // key into S3 bucket
      videos: ["https://www.youtube.com/watch?v=QF7g3rCnD-w"],
      location: location,
      related_cases: ["1", "2", "3", "4"],
      related_methods: ["145", "146", "147"],
      related_organizations: ["199", "200", "201"]
    });
}

async function setupRelatedObjectsSingle() {
  // setup relations with exactly one item
  await chai
    .putJSON("/case/38")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      related_cases: [{ id: 70 }],
      related_methods: [{ id: 170 }],
      related_organizations: [{ id: 270 }]
    });
}

async function setupRelatedObjectsMultiple() {
  // setup relations with multiple items
  await chai
    .putJSON("/case/37")
    .set("Authorization", "Bearer " + tokens.user_token)
    .send({
      related_cases: [{ id: 45 }, { id: 63 }],
      related_methods: [{ id: 145 }, { id: 163 }],
      related_organizations: [{ id: 245 }, { id: 263 }]
    });
}

describe("Cases", () => {
  describe("Lookup", () => {
    it("finds case 100", async () => {
      const res = await chai.getJSON("/case/100").send({});
      res.should.have.status(200);
      res.body.data.id.should.be.a("number");
    });
  });
  describe("Adding", () => {
    it("fails without authentication", async () => {
      try {
        const res = await chai.postJSON("/case/new").send({});
        // fail if error not thrown
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(401);
      }
    });
    it("fails without content", async () => {
      try {
        const res = await chai
          .postJSON("/case/new")
          .set("Authorization", "Bearer " + tokens.user_token)
          .send({});
        should.exist(res.status);
      } catch (err) {
        err.should.have.status(400);
      }
    });
    it("works with authentication", async () => {
      const res = await addBasicCase();
      res.should.have.status(201);
      res.body.OK.should.be.true;
      res.body.data.thingid.should.be.a("number");
      let returnedCase = res.body.object;
      returnedCase.related_cases.length.should.equal(4);
      returnedCase.related_methods.length.should.equal(3);
      returnedCase.related_organizations.length.should.equal(3);
    });
  });
  describe("Related Objects", () => {
    it("test related objects empty", async () => {
      const res = await chai.getJSON("/case/39").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(0);
      res.body.data.related_methods.should.have.lengthOf(0);
      res.body.data.related_organizations.should.have.lengthOf(0);
    });
    it("test related objects with single item", async () => {
      await setupRelatedObjectsSingle();
      const res = await chai.getJSON("/case/38").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(1);
      res.body.data.related_cases[0].id.should.equal(70);
      res.body.data.related_methods.should.have.lengthOf(1);
      res.body.data.related_methods[0].id.should.equal(170);
      res.body.data.related_organizations.should.have.lengthOf(1);
      res.body.data.related_organizations[0].id.should.equal(270);
    });
    it("test related objects with multiple items", async () => {
      await setupRelatedObjectsMultiple();
      const res = await chai.getJSON("/case/37").send({});
      res.should.have.status(200);
      res.body.data.related_cases.should.have.lengthOf(2);
      res.body.data.related_cases[0].id.should.equal(45);
      res.body.data.related_cases[1].id.should.equal(63);
      res.body.data.related_methods.should.have.lengthOf(2);
      res.body.data.related_methods[0].id.should.equal(145);
      res.body.data.related_methods[1].id.should.equal(163);
      res.body.data.related_organizations.should.have.lengthOf(2);
      res.body.data.related_organizations[0].id.should.equal(245);
      res.body.data.related_organizations[1].id.should.equal(263);
    });
  });

  it("test SQL santization", async () => {
    const res = await addBasicCase();
    res.should.have.status(201);
  });

  describe("Counting by country", () => {
    it("returns stuff", async () => {
      const res = await chai
        .getJSON("/case/countsByCountry")
        .set("Authorization", "Bearer " + tokens.user_token);
      let countryCounts = res.body.data.countryCounts;
      countryCounts.should.have.property("france");
      res.should.have.status(200);
    });
  });

  describe("Get case with tags", () => {
    it("should have 3 tags", async () => {
      const res = await chai.getJSON("/case/39");
      res.body.OK.should.equal(true);
      res.should.have.status(200);
      let the_case = res.body.data;
      the_case.tags.should.have.lengthOf(3);
      the_case.bookmarked.should.equal(false);
    });
  });

  describe("Get case with authentication", () => {
    it("should not fail when logged in", async () => {
      try {
        const res = await chai
          .getJSON("/case/100")
          .set("Authorization", "Bearer " + tokens.user_token);
        res.body.OK.should.equal(true);
        res.should.have.status(200);
      } catch (e) {
        console.error(e);
      }
    });
  });

  describe("Test edit API", () => {
    it("Add case, then null modify it", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origCase = res1.body.object;
      origCase.id.should.be.a("number");
      origCase.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({}); // empty update
      res2.should.have.status(200);
      const updatedCase1 = res2.body.data;
      updatedCase1.should.deep.equal(origCase); // no changes saved
    });

    it("Add case, then modify title and/or body", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origCase = res1.body.object;
      origCase.id.should.be.a("number");
      origCase.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Second Title" }); // empty update
      res2.should.have.status(200);
      const updatedCase1 = res2.body.data;
      updatedCase1.title.should.equal("Second Title");
      updatedCase1.body.should.equal("First Body");
      const res3 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ body: "Second Body" }); // empty update
      res3.should.have.status(200);
      const updatedCase2 = res3.body.data;
      updatedCase2.title.should.equal("Second Title");
      updatedCase2.body.should.equal("Second Body");
      const res4 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ title: "Third Title", body: "Third Body" }); // empty update
      res4.should.have.status(200);
      const updatedCase3 = res4.body.data;
      updatedCase3.title.should.equal("Third Title");
      updatedCase3.body.should.equal("Third Body");
      updatedCase3.authors.length.should.equal(updatedCase2.authors.length + 1);
    });

    it("Add case, then modify some fields", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      res1.body.data.thingid.should.be.a("number");
      const origCase = res1.body.object;
      origCase.id.should.be.a("number");
      origCase.id.should.equal(res1.body.data.thingid);
      const res2 = await chai
        .putJSON("/case/" + res1.body.data.thingid)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ issue: "new issue" }); // empty update
      res2.should.have.status(200);
      const updatedCase1 = res2.body.data;
      updatedCase1.issue.should.equal("new issue");
    });

    it("Add case, then modify lead image", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      const case1 = res1.body.object;
      case1.lead_image.url.should.equal("CitizensAssembly_2.jpg");
      const res2 = await chai
        .putJSON("/case/" + case1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ lead_image: { url: "foobar.jpg", title: "" } });
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      should.exist(res2.body.data);
      const case2 = res2.body.data;
      case2.lead_image.url.should.equal("foobar.jpg");
      case2.updated_date.should.be.above(case1.updated_date);
      const res3 = await chai
        .putJSON("/case/" + case1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          lead_image: {
            url: "howzaboutthemjpegs.png",
            title: "Innocuous Title"
          }
        });
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const case3 = res3.body.data;
      case3.lead_image.url.should.equal("howzaboutthemjpegs.png");
      case3.lead_image.title.should.equal("Innocuous Title");
    });

    it("Add case, then change related objects", async () => {
      const res1 = await addBasicCase();
      const case1 = res1.body.object;
      case1.related_cases.should.have.lengthOf(4);
      case1.related_cases.map(x => x.id).should.deep.equal([1, 2, 3, 4]);
      const related_cases = case1.related_cases.slice();
      related_cases.shift(); // remove first one
      related_cases.push({ id: 5 }, { id: 6 });
      const res2 = await chai
        .putJSON("/case/" + case1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ related_cases });
      const case2 = res2.body.data;
      case2.related_cases.map(x => x.id).should.deep.equal([2, 3, 4, 5, 6]);
      // test bidirectionality
      const res3 = await chai.getJSON("/case/6").send({});
      const case3 = res3.body.data;
      case3.related_cases.map(x => x.id).should.include(case1.id);
    });
  });

  describe("Test bookmarked", () => {
    let case1 = null;
    it("Add case, should not be bookmarked", async () => {
      const res1 = await addBasicCase();
      res1.should.have.status(201);
      res1.body.OK.should.be.true;
      case1 = res1.body.object;
      case1.bookmarked.should.be.false;
      const booked = await chai
        .postJSON("/bookmark/add")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({ bookmarkType: "case", thingid: case1.id });
      booked.should.have.status(200);
    });
    it("Not authenticated, bookmarked should be false", async () => {
      const res2 = await chai.getJSON("/case/" + case1.id).send({});
      res2.should.have.status(200);
      res2.body.OK.should.be.true;
      const case2 = res2.body.data;
      case2.bookmarked.should.be.false;
    });
    it("Bookmarked should be true", async () => {
      const res3 = await chai
        .getJSON("/case/" + case1.id)
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({});
      res3.should.have.status(200);
      res3.body.OK.should.be.true;
      const case3 = res3.body.data;
      case3.bookmarked.should.be.true;
    });
  });
  describe("More case creation tests", () => {
    it("Create with array of URLs", async () => {
      const res = await chai
        .postJSON("/case/new")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "First Title",
          body: "First Body",
          // optional
          other_images: [
            "https://s-media-cache-ak0.pinimg.com/736x/3d/2b/bf/3d2bbfd73ccaf488ab88d298ab7bc2d8.jpg",
            "https://ocs-pl.oktawave.com/v1/AUTH_e1d5d90a-20b9-49c9-a9cd-33fc2cb68df3/mrgugu-products/20150901170519_1afZHYJgZTruGxEc_1000-1000.jpg"
          ]
        });
      res.should.have.status(201);
      res.body.OK.should.be.true;
      const theCase = res.body.object;
      theCase.other_images.should.have.lengthOf(2);
    });
    it("Create case with array of attachment objects", async () => {
      const res = await chai
        .postJSON("/case/new")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          title: "Earth First",
          body: "Mars Second",
          other_images: [
            { url: "http://placekitten.com/200/300" },
            { url: "http://placekitten.com/300/200" }
          ]
        });
      res.should.have.status(201);
      res.body.OK.should.be.true;
      const theCase = res.body.object;
      theCase.other_images.should.have.lengthOf(2);
    });
  });
});

module.exports = { addBasicCase };
