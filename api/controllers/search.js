"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let {
  db,
  as,
  TITLES_FOR_THINGS,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
} = require("../helpers/db");
let { 
  preparse_query,
  getSearchResults,
} = require("../helpers/search");
const {
  supportedTypes,
  parseGetParams,
  typeFromReq,
  limitFromReq,
} = require("../helpers/things");
const {
  createCSVEntry,
  uploadCSVFile
} = require("../helpers/export-helpers");
const logError = require("../helpers/log-error.js");
const { RESPONSE_LIMIT } = require("./../../constants.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES;

function randomTexture() {
  let index = Math.floor(Math.random() * 6) + 1;
  return `/images/texture_${index}.svg`;
}

function getLanguage(req) {
  // once we have translations for user generated content in all supported languages,
  // we can use the locale cookie to query by language.
  // currently if the locale is set to something other than "en", no results are returned,
  // so hardcoding "en" here
  return req.cookies.locale || "en";
}

/**
 *  Deprecated, use /list/* methods instead
 *
 */
router.get("/getAllForType", async function getAllForType(req, res) {
  try {
    let objType = req.query.objType.toLowerCase();
    let page = Math.max(parseInt(req.query.page || 1), 1);
    if (Number.isNaN(page)) {
      page = 1;
    }
    let offset = 0;
    let response_limit = Number.MAX_SAFE_INTEGER;
    if (!req.query.response_limit) {
      // do nothing, return everything
    } else if (
      req.query.response_limit &&
      req.query.response_limit.toLowerCase() === "none"
    ) {
      response_limit = Number.MAX_SAFE_INTEGER;
    } else {
      response_limit = parseInt(req.query.response_limit || RESPONSE_LIMIT);
      offset = Math.max(page - 1, 0) * response_limit;
    }
    if (!supportedTypes.includes(objType)) {
      res.status(401).json({
        message: "Unsupported objType for getAllForType: " + objType,
      });
    }
    const titlelist = await db.any(TITLES_FOR_THINGS, {
      language: as.value(getLanguage(req)),
      limit: response_limit,
      offset: offset,
      type: objType,
    });
    let jtitlelist = {};
    // FIXME: this is a dumb format but it is what front-end expects.
    // Switch both (and tests) to use array of {title: , id: } pairs.
    // Also, if we're going to use {OK: true, data: []} everywhere else
    // we should use it here too.
    titlelist.forEach(function(row) {
      jtitlelist[row.title] = Number(row.thingid);
    });
    res.status(200).json(jtitlelist);
  } catch (error) {
    logError(error);
    res.status(500).json({ error: error });
  }
});

const redirectToSearchPageIfHasCollectionsQueryParameter = (req, res, next) => {
  if (req.query.hasOwnProperty('collections')) {
    res.redirect('/search?selectedCategory=collections');
    return;
  }

  return next();
};

/**
 * @api {get} /search Search through the cases
 * @apiGroup Search
 * @apiVersion 0.1.0
 * @apiName search
 *
 * @apiParam  {String} query query term
 * @apiParam  {String} sortingMethod ('chronological' or 'alphabetical' or 'featured')
 * @apiParam  {String} selectedCategory ('All' or 'Case' or 'Method' or 'Organization' or 'News')
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data Mapping of country names to counts (when `OK` is true)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *          ... (records) ...
 *       }
 *     }
 *
 */

// Should not return things that aren't displayable as SearchHits (i.e. Users...)

// two factors for search: if there is a selectedCategory then filter by it, always
// if there is no query OR the query is "featured" then return all featured items
// One further item: need an alternative search which returns only map-level items and has no pagination

router.get("/", redirectToSearchPageIfHasCollectionsQueryParameter, async function(req, res) {
  const user_query = req.query.query || "";
  const parsed_query = preparse_query(user_query);
  const limit = limitFromReq(req);
  const lang = as.value(getLanguage(req));
  const type = typeFromReq(req);
  const params = parseGetParams(req, type);
  const langQuery = SUPPORTED_LANGUAGES.find(element => element.twoLetterCode === lang).name.toLowerCase();

  if(req.query.returns == "csv"){
    if (!req.user){
      req.session.returnTo = req.originalUrl;
      res.redirect("/login");
    }
      let csv_export_id = await createCSVEntry(req.user.id, type);
      let uploadCSVFiles = uploadCSVFile(user_query, limit, langQuery, lang, type, parsed_query, req, csv_export_id);
      return res.status(200).redirect("/exports/csv")
  } else {
    try {
      let results = await getSearchResults(user_query, limit, langQuery, lang, type, parsed_query, req);
      if (req.query.resultType === "map" && parsed_query) {
        results = results.filter(result => result.searchmatched);
      }
  
      const total = Number(
        results.length ? results[0].total || results.length : 0
      );
      const searchhits = results.filter(result => result.searchmatched).length;
      const pages = Math.max(limit ? Math.ceil(total / limit) : 1, 1); // Don't divide by zero limit, don't return page 1 of 1
      results.forEach(obj => {
        // massage results for display
        if (obj.photos && obj.photos.length) {
          obj.photos.forEach(img => {
            if (!img.url.startsWith("http")) {
              img.url = process.env.AWS_UPLOADS_URL + encodeURIComponent(img.url);
            }
          });
        } else {
          obj.photos = [{ url: randomTexture() }];
        }
        delete obj.total;
      });
      let OK = true;
      let returnType = req.query.returns;
      switch (returnType) {
        case "json":
          return res.status(200).json({
            total,
            pages,
            searchhits,
            results,
            user_query,
            parsed_query,
            params,
            user: req.user || null,
          });
        case "htmlfrag":
          return res.status(200).render("search", {
            total,
            pages,
            searchhits,
            results,
            params,
            user: req.user || null,
          });
        case "xml":
          return res.status(500, "XML not implemented yet").render();
        case "html": // fall through
        default:
          return res.status(200).render("search", {
            OK,
            total,
            pages,
            searchhits,
            results,
            params,
            user: req.user || null,
          });
      }
    } catch (error) {
      console.error("Error in /search: %s", error.message);
      logError(error);
      let OK = false;
      res.status(500).json({ OK, error });
    }
  }
});

/*
 * Deprecated, use /search/?resultType=map
 *
 */
router.get("/map", async function(req, res) {
  try {
    const RESPONSE_LIMIT = 1000;
    const offset = 0;
    const cases = await db.any(LIST_MAP_CASES, {
      language: as.value(getLanguage(req)),
      limit: RESPONSE_LIMIT,
      offset: offset,
    });
    const orgs = await db.any(LIST_MAP_ORGANIZATIONS, {
      language: as.value(getLanguage(req)),
      limit: RESPONSE_LIMIT,
      offset: offset,
    });

    res.status(200).json({ data: { cases, orgs } });
  } catch (error) {
    logError(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
