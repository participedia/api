"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let { as } = require("../helpers/db");
let { 
  preparse_query,
  getSearchResults,
} = require("../helpers/search");
const {
  parseGetParams,
  typeFromReq,
  limitFromReq,
} = require("../helpers/things");
const {
  processCSVFile
} = require("../helpers/export-helpers");
const logError = require("../helpers/log-error.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES;

function randomTexture() {
  let index = Math.floor(Math.random() * 6) + 1;
  return `/images/texture_${index}.svg`;
}

function getLanguage(req) {
  return req.cookies.locale || "en";
}

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

router.get("/", redirectToSearchPageIfHasCollectionsQueryParameter, async (req, res) => {
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
    } else {
      let paramsForCSV = {
        userId: req.user.id,
        type: type,
        page: 'search'
      }
      let paramsForQuery = {
        user_query: user_query,
        limit: limit ? limit : null, // null is no limit in SQL
        langQuery: langQuery,
        lang: lang,
        type: type,
        parsed_query: parsed_query,
        req: req,
        page: 'search'
      }
      try {
        
        // for staging or production server
        if(paramsForQuery.page == 'search' && !process.env.APP_LOCAL){
          processCSVFile(paramsForQuery, paramsForCSV);
          setTimeout(() => {
            return res.status(200).redirect("/exports/csv");
          }, 3000);
        } else {
          // for dev/local devices
          let csv_export_id = await createCSVEntry(paramsForCSV);
          uploadCSVFile(paramsForQuery, csv_export_id);
          return res.status(200).redirect("/exports/csv");
        }
      } catch (error) {
        logError(error);
        let OK = false;
        res.status(500).json({ OK, error });
      }
    }
  } else {
    try {
      let results = await getSearchResults(user_query, limit, langQuery, lang, type, parsed_query, req);
      if (req.query.resultType === "map" && parsed_query) {
        results = results.filter(result => result.searchmatched);
      }
      const total = Number(results.length ? results[0].total || results.length : 0);
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

module.exports = router;
