const tokens = require("./setupenv");
const app = require("../app");

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;
  // your helpers here
  utils.addMethod(chai, "postJSON", url => {
    return chai
      .request(app)
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
  });
  utils.addMethod(chai, "getJSON", url => {
    return chai
      .request(app)
      .get(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
  });
  utils.addMethod(chai, "putJSON", url => {
    return chai
      .request(app)
      .put(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
  });
  utils.addMethod(chai, "deleteJSON", url => {
    return chai
      .request(app)
      .delete(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
  });
};
