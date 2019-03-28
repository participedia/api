"use strict";

const path = require("path");
const process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const app = require("express")();
const exphbs = require("express-handlebars");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const i18n = require('i18n-2');
const apicache = require("apicache");
const express = require("express");
const compression = require("compression");
const AWS = require("aws-sdk");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cors = require("cors");

// Actual Participedia APIS vs. Nodejs gunk
const handlebarsHelpers = require("./api/helpers/handlebars-helpers.js");
const case_ = require("./api/controllers/case");
const method = require("./api/controllers/method");
const organization = require("./api/controllers/organization");
const bookmark = require("./api/controllers/bookmark");
const search = require("./api/controllers/search");
const list = require("./api/controllers/list");
const user = require("./api/controllers/user");
const isUser = require("./api/middleware/isUser");

const port = process.env.PORT || 3001;

const {
  checkJwtRequired,
  checkJwtOptional
} = require("./api/helpers/checkJwt");
const { ensureUser, preferUser } = require("./api/helpers/user");

// CONFIGS
AWS.config.update({ region: "us-east-1" });
app.use(compression());
app.set("port", port);
app.use(express.static("public", { index: false }));
app.use(morgan("dev")); // request logging
app.use(methodOverride()); // Do we actually use/need this?
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
// handle expired login tokens more gracefully
app.use(ensureUser.unless({ method: ["OPTIONS", "GET"] }));
app.use(
  preferUser.unless({ method: ["OPTIONS", "POST", "PUT", "DELETE", "PATCH"] })
);
app.use(errorhandler());

i18n.expressBind(app, {
  locales: ["en", "fr", "de"],
  defaultLocale: "en",
  extension: ".json",
  cookieName: "locale",
});

app.use((req, res, next) => {
  req.i18n.setLocaleFromCookie();
  next();
});

const cache = apicache.middleware;
apicache.options({
  debug: true,
  enabled: false,
  successCodes: [200, 201]
});
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

const hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  defaultLayout: "main",
  extname: ".html",
  helpers: handlebarsHelpers
});

app.engine(".html", hbs.engine);
app.set("view engine", ".html");

// make data available as local vars in templates
app.use((req, res, next) => {
  const getGATrackingId = () => {
    if (app.get("env") === "production") {
      return "UA-132033152-1";
    } else {
      // development or staging
      return "UA-132033152-2";
    }
  };

  res.locals.req = req;
  res.locals.GA_TRACKING_ID = getGATrackingId();
  next();
});

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

// ROUTES
app.use("/", cache("5 minutes"), search);

app.use("/case", case_);
app.use("/organization", organization);
app.use("/method", method);
app.use("/list", list);
app.use("/user", user);
app.use("/bookmark", bookmark);

app.get("/about", function(req, res) {
  res.status(200).render("about-view");
});
app.get("/legal", function(req, res) {
  res.status(200).render("legal-view");
});
app.get("/research", function(req, res) {
  res.status(200).render("research-view");
});
app.get("/teaching", function(req, res) {
  res.status(200).render("teaching-view");
});
app.get("/content-chooser", function(req, res) {
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

app.get("/redirect", function(req, res) {
  console.log("request URL: %s", req.originalUrl);
  return res.status(200).render("experiments-edit");
});

module.exports = app;
