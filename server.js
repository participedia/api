"use strict";
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let http = require("http");
let app = require("./app");
let { cacheTitlesRefreshSearch } = require("./api/helpers/db");

async function startServer() {
  await cacheTitlesRefreshSearch();
  http.createServer(app).listen(app.get("port"), function() {
    console.log("Express server listening on port %s", app.get("port"));
  });
}

startServer();
