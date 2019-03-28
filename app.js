"use strict";

const path = require("path");
const process = require("process");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const app = require("express")();
const exphbs = require("express-handlebars");
const fs = require("fs");
const handlebarsHelpers = require("./api/helpers/handlebars-helpers.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
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
  locales: ["en", "fr"],
  defaultLocale: "en",
  extension: ".json",
});

app.use(function(req, res, next) {
  req.i18n.setLocaleFromCookie();
  next();
});

const { getUserOrCreateUser } = require("./api/helpers/user.js");

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
  callbackURL: "/redirect"
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

passport.deserializeUser(async function (user, done) {
  // get db user from auth0 user data
  const dbUser = await getUserOrCreateUser(user._json);
  done(null, dbUser);
});

// Perform the login, after login Auth0 will redirect to callback
app.get("/login", passport.authenticate("auth0", {
  scope: "openid email profile"
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
  const currentUrl = `${req.protocol}://${req.headers.host}`;
  req.logout();
  res.redirect(`https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${currentUrl}`);
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

module.exports = app;
