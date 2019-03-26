"use strict";

let path = require("path");
let process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let app = require("express")();
var exphbs = require("express-handlebars");
const fs = require("fs");
const handlebarsHelpers = require("./api/helpers/handlebars-helpers.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

// static text js objects
const sharedStaticText = require("./static-text/shared-static-text.js");
const aboutStaticText = require("./static-text/about-static-text.js");
const researchStaticText = require("./static-text/research-static-text.js");
const teachingStaticText = require("./static-text/teaching-static-text.js");
const contentTypesText = require("./static-text/content-types-static-text.js");

// config express-session
const sess = {
  secret: "THIS IS A RANDOM KEY",
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (app.get("env") === "production") {
  sess.cookie.secure = true; // serve secure cookies, requires https
}

app.use(session(sess));

// Configure Passport to use Auth0
const strategy = new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL || "/redirect"
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Perform the login, after login Auth0 will redirect to callback
app.get("/login", passport.authenticate("auth0", {
  scope: "offline_access openid email profile"
}), function (req, res) {
  res.redirect("/");
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
app.get("/redirect", function (req, res, next) {
  passport.authenticate("auth0", function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect("/login"); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      // todo: return to original url where /login was requested from
      res.redirect(returnTo || '/');
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  defaultLayout: "main",
  extname: ".html",
  helpers: handlebarsHelpers
});

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
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
// handle expired login tokens more gracefully
app.use(ensureUser.unless({ method: ["OPTIONS", "GET"] }));
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

app.get("/about", function(req, res) {
  const staticText = Object.assign({}, sharedStaticText, aboutStaticText);
  res.status(200).render("about-view", { static: staticText });
});
app.get("/legal", function(req, res) {
  res.status(200).render("legal-view");
});
app.get("/research", function(req, res) {
  const staticText = Object.assign({}, sharedStaticText, researchStaticText);
  res.status(200).render("research-view", { static: staticText });
});
app.get("/teaching", function(req, res) {
  const staticText = Object.assign({}, sharedStaticText, teachingStaticText);
  res.status(200).render("teaching-view", {
    static: staticText
  });
});
app.get("/content-chooser", function(req, res) {
  const staticText = Object.assign({}, sharedStaticText, contentTypesText);
  res.status(200).render("content-chooser", {
    static: staticText
  });
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
