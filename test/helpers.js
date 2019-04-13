const tokens = require("./setupenv");
const app = require("../app");
const fs = require("fs");

const LOGIN_TEMPLATE = JSON.parse(fs.readFileSync("test/data/login.json"));
LOGIN_TEMPLATE.client_id = process.env.AUTH0_CLIENT_ID;
LOGIN_TEMPLATE.password = process.env.AUTH0_TEST_PASSWORD;
LOGIN_TEMPLATE.username = process.env.AUTH0_TEST_USERNAME;
LOGIN_TEMPLATE.redirect_uri = process.env.AUTH0_REDIRECT;

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;
  // your helpers here
  utils.addMethod(chai, "auth", url => {
    return chai
      .request(app)
      .post("https://participedia.auth0.com/usernamepassword/login")
      .set("Content-Type", "application/json")
      .send(LOGIN_TEMPLATE);
  });
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
