"use strict";
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });

// only instantiate new relic logging if we are on staging or prod
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
  require("newrelic");
}

let http = require("http");
let app = require("./app");

http.createServer(app).listen(app.get("port"), function() {
  console.log("Express server listening on port %s", app.get("port"));
});
