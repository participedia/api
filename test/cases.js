let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

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

describe("Cases", () => {
  describe("Lookup", () => {
    it("finds case 100", done => {
      chai
        .request(app)
        .get("/case/100")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("Adding", () => {
    it("fails without authentication", done => {
      chai
        .request(app)
        .post("/case/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("fails without content", done => {
      chai
        .request(app)
        .post("/case/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("works with authentication", done => {
      chai
        .request(app)
        .post("/case/new")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .send({
          // mandatory
          title: "This is the first title of the rest of your post",
          body: "Eat this, it is my body",
          // optional
          lead_image: "CitizensAssembly_2.jpg", // key into S3 bucket
          vidURL: "https://www.youtube.com/watch?v=QF7g3rCnD-w",
          location: location,
          relatedCases: ["1", "2", "3", "4"],
          relatedMethods: ["145", "146", "147"],
          relatedOrganizations: ["199", "200", "201"]
        })
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });
  it("test related objects empty", done => {
    chai
      .request(app)
      .get("/case/39")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + tokens.user_token)
      .send({})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.related_cases.should.have.lengthOf(0);
        res.body.related_methods.should.have.lengthOf(0);
        res.body.related_organizations.should.have.lengthOf(0);
        done();
      });
  });
  it("test related objects with single item", done => {
    chai
      .request(app)
      .get("/case/38")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + tokens.user_token)
      .send({})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.related_cases.should.have.lengthOf(1);
        res.body.related_cases[0].id.should.equal(70);
        res.body.related_methods.should.have.lengthOf(1);
        res.body.related_methods[0].id.should.equal(170);
        res.body.related_organizations.should.have.lengthOf(1);
        res.body.related_methods[0].id.should.equal(270);
        done();
      });
  });
  it("test SQL santization", done => {
    chai
      .request(app)
      .post("/case/new")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + tokens.user_token)
      .send({
        // mandatory
        title: "This is the first'); drop table users; -- title of the rest of your post",
        body: "Eat this, '); drop table users; -- it is my body",
        // optional
        lead_image: "CitizensAssembly_2.jpg'); drop table users; --", // key into S3 bucket
        vidURL: "https://www.youtube.com/watch?v=QF7g3rCnD-w'); drop table users; --",
        location: location,
        relatedCases: ["1", "2", "3", "4"],
        relatedMethods: ["145", "146", "147"],
        relatedOrganizations: ["199", "200", "201"]
      })
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });
  // let userID = tokens.user_payload.user_id;
  describe("Counting by country", () => {
    it("returns stuff", done => {
      chai
        .request(app)
        .get("/case/countsByCountry")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Bearer " + tokens.user_token)
        .end((err, res) => {
          let countryCounts = res.body.data.countryCounts;
          countryCounts.should.have.property("france");
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("Get case with tags", () => {
    it("should have 3 tags", done => {
      chai
        .request(app)
        .get("/case/39")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          res.body.OK.should.equal(true);
          res.should.have.status(200);
          let the_case = res.body.data;
          the_case.tags.should.have.lengthOf(3);
          the_case.bookmarked.should.equal(false);
          done();
        });
    });
  });
});
