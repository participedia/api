"use strict";
const app = require("express");
const Sentry = require("@sentry/node");

const api = app.Router();
const {
    db,
    CASE,
    METHOD,
    ORGANIZATION,
} = require("../../helpers/db");


const {
    parseAPIGetParams,
} = require("./api-things");  

const {
    apiErrorHandler,
    auth,
    apiPromiseErrorHandler,
} = require("./api-helpers");  

// only instantiate sentry logging if we are on staging or prod
if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "staging"
  ) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
    });
    // The request handler must be the first middleware on the app
    api.use(Sentry.Handlers.requestHandler());
  }

api.use('/v1', auth, api); 

api.get("/cases", async function(req, res, next) {
    const params = parseAPIGetParams(req);
    if(params.error) {
        return res.status(400).json({
            error: params.error,
        });
    }
    const results = await db.any(CASE, {
        query: '',
        limit: params.limit,
        offset: params.skip,
        language: params.locale,
        userId: req.user ? req.user.id : null,
        sortby: params.sortKey,
        orderby: params.sortOrder,
      }).catch(err => {
          return next(err);
      });
    res.status(200).json({
        cases: results.map(result => result.results),
    });
});

api.get("/methods", async function(req, res, next) {
    const params = parseAPIGetParams(req);
    if(params.error) {
        return res.status(400).json({
            error: params.error,
        });
    }
    const results = await db.any(METHOD, {
        query: '',
        limit: params.limit,
        offset: params.skip,
        language: params.locale,
        userId: req.user ? req.user.id : null,
        sortby: params.sortKey,
        orderby: params.sortOrder,
      }).catch(err => {
          return next(err);
      });
    res.status(200).json({
        methods: results.map(result => result.results),
    });
});

api.get("/organizations", async function(req, res, next) {
    const params = parseAPIGetParams(req);
    if(params.error) {
        return res.status(400).json({
            error: params.error,
        });
    }
    const results = await db.any(ORGANIZATION, {
        query: '',
        limit: params.limit,
        offset: params.skip,
        language: params.locale,
        userId: req.user ? req.user.id : null,
        sortby: params.sortKey,
        orderby: params.sortOrder,
      }).catch(err => {
          console.log(err);
          return next(err);
      });
    res.status(200).json({
        organizations: results.map(result => result.results),
    });
});

api.use((req, res, next) => {
    res.status(404).json({
        message: "Resource not found"
    });
});

api.use(Sentry.Handlers.errorHandler());

if (process.env.NODE_ENV === "development") {
    api.use(apiErrorHandler);
}
module.exports = api;

