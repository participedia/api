"use strict";

let path = require("path");
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let app = require("express")();
let jwt = require("./api/helpers/jwt")();

if (
  process.env.NODE_ENV === "test" &&
  process.env.AUTH0_CLIENT_SECRET !== "notasecret"
) {
  console.log(
    "CODING ERROR: Someone imported 'app' before 'setupenv' in the test suite"
  );
  process.exit(1);
}

// Set up the token security handler
// let config = {
//   appRoot: path.join(__dirname, ".."), // required config
//   validateResponse: false
// };
let express = require("express");
let compression = require("compression");
let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
app.use(compression());
let port = process.env.PORT || 3001;
let case_ = require("./api/controllers/case");
let search = require("./api/controllers/search");
let organization = require("./api/controllers/organization");
let user = require("./api/controllers/user");
let bookmark = require("./api/controllers/bookmark");
let method = require("./api/controllers/method");
let errorhandler = require("errorhandler");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let methodOverride = require("method-override");
let cors = require("cors");
let isUser = require("./api/middleware/isUser");
let jwt = require("express-jwt");

app.set("port", port);
app.use(morgan("dev"));
app.use(methodOverride());
app.use(cors());
app.use(bodyParser.json());
app.use(
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"]
  }).unless({ method: ["OPTIONS", "GET"] })
);
app.use(express.static(path.join(__dirname, "swagger")));
app.use(errorhandler());

let cache = require("apicache").middleware;
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

app.use("/search", cache("5 minutes"), search);

app.use("/case", case_);
app.use("/organization", organization);
app.use("/method", method);
app.use("/user", user);
app.use("/bookmark", bookmark);

app.use(
  "/s3/:path",
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET
  }),
  isUser
);
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
