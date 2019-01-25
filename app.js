"use strict";

let path = require("path");
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let app = require("express")();
var exphbs = require("express-handlebars");
const fs = require("fs");
const handlebarsHelpers = require("./api/helpers/handlebars-helpers.js");

var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  defaultLayout: "main",
  extname: ".html",
  helpers: handlebarsHelpers,
});

// make the req var available as local var in templates
app.use((req, res, next) => {
  res.locals.req = req;
  next();
});

app.engine(".html", hbs.engine);
app.set("view engine", ".html");

if (
  process.env.NODE_ENV === "test" &&
  process.env.AUTH0_CLIENT_SECRET !== "notasecret"
) {
  console.error(
    "CODING ERROR: Someone imported 'app' before 'setupenv' in the test suite"
  );
  process.exit(1);
}

// Better logging of "unhandled" promise exceptions
process.on("unhandledRejection", function(reason, p) {
  console.warn(
    "Possibly Unhandled Rejection at: Promise ",
    p,
    " reason: ",
    reason
  );
  // application specific logging here
});

let express = require("express");
let compression = require("compression");
let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
app.use(compression());
let port = process.env.PORT || 3001;

// Actual Participedia APIS vs. Nodejs gunk
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
app.use(express.static("public", { index: false }));
app.use(morgan("dev")); // request logging
app.use(methodOverride()); // Do we actually use/need this?
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(checkJwtRequired.unless({ method: ["OPTIONS", "GET"] }));
app.use(ensureUser.unless({ method: ["OPTIONS", "GET"] }));
app.use(
  checkJwtOptional.unless({
    method: ["OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
  })
);
app.use(
  preferUser.unless({ method: ["OPTIONS", "POST", "PUT", "DELETE", "PATCH"] })
);
app.use(errorhandler());

const apicache = require("apicache");
const cache = apicache.middleware;
apicache.options({
  debug: true,
  enabled: false,
  successCodes: [200, 201]
});
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

app.use("/", cache("5 minutes"), search);

app.use("/case", case_);
app.use("/organization", organization);
app.use("/method", method);
app.use("/list", list);
app.use("/user", user);
app.use("/bookmark", bookmark);

app.get('/about', function (req, res) {
  res.status(200).render("about-view");
});
app.get('/legal', function (req, res) {
  res.status(200).render("legal-view");
});
app.get('/research', function (req, res) {
  res.status(200).render("research-view");
});
app.get('/teaching', function (req, res) {
  res.status(200).render("teaching-view");
});
app.get('/content-chooser', function (req, res) {
  res.status(200).render("content-chooser");
});

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
