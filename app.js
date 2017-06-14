"use strict";

let path = require("path");
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let app = require("express")();

if (
  process.env.NODE_ENV === "test" &&
  process.env.AUTH0_CLIENT_SECRET !== "notasecret"
) {
  console.error(
    "CODING ERROR: Someone imported 'app' before 'setupenv' in the test suite"
  );
  process.exit(1);
}

let express = require("express");
let compression = require("compression");
let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
app.use(compression());
let port = process.env.PORT || 3001;
let case_ = require("./api/controllers/case");
let method = require("./api/controllers/method");
let organization = require("./api/controllers/organization");
let bookmark = require("./api/controllers/bookmark");
let search = require("./api/controllers/search");
let list = require("./api/controllers/list");
let user = require("./api/controllers/user");
let errorhandler = require("errorhandler");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let methodOverride = require("method-override");
let cors = require("cors");
let isUser = require("./api/middleware/isUser");
const {
  checkJwtRequired,
  checkJwtOptional
} = require("./api/helpers/checkJwt");
let { ensureUser, preferUser } = require("./api/helpers/user");

app.set("port", port);
app.use(morgan("dev"));
app.use(methodOverride());
app.use(cors());
app.use(bodyParser.json());
app.use(checkJwtRequired.unless({ method: ["OPTIONS", "GET"] }));
app.use(ensureUser.unless({ method: ["OPTIONS", "GET"] }));
app.use(
  checkJwtOptional.unless({ method: ["OPTIONS", "POST", "PUT", "DELETE"] })
);
app.use(preferUser.unless({ method: ["OPTIONS", "POST", "PUT", "DELETE"] }));
app.use(express.static(path.join(__dirname, "swagger")));
app.use(errorhandler());

let cache = require("apicache").middleware;
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

app.use("/search", cache("5 minutes"), search);

app.use("/case", case_);
app.use("/organization", organization);
app.use("/method", method);
app.use("/list", list);
app.use("/user", user);
app.use("/bookmark", bookmark);

app.use("/s3/:path", checkJwtRequired);
app.use(
  "/s3",
  require("react-dropzone-s3-uploader/s3router")({
    bucket: "uploads.participedia.xyz",
    region: "us-east-1", // optional
    headers: { "Access-Control-Allow-Origin": "*" }, // optional
    ACL: "private" // this is default
  })
);

module.exports = app;
