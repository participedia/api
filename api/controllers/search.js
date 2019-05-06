"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let {
  db,
  as,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS
} = require("../helpers/db");
let { preparse_query } = require("../helpers/search");
let log = require("winston");
const { supportedTypes, parseGetParams } = require("../helpers/things");

const RESPONSE_LIMIT = 20;

function randomTexture() {
  let index = Math.floor(Math.random() * 6) + 1;
  return `/images/texture_${index}.svg`;
}

/**
 *  Deprecated, use /list/* methods instead
 *
 */
router.get("/getAllForType", async function getAllForType(req, res) {
  try {
    let objType = req.query.objType.toLowerCase();
    let page = Math.max(parseInt(req.query.page || 1), 1);
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
        message: "Unsupported objType for getAllForType: " + objType
      });
    }
    const titlelist = await db.any(TITLES_FOR_THINGS, {
      language: as.value(req.cookies.locale || "en"),
      limit: response_limit,
      offset: offset,
      type: objType
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
    log.error("Exception in GET /search/getAllForType", error);
    res.status(500).json({ error: error });
  }
});

// strip off final character (assumed to be "s")
const singularLowerCase = name =>
  (name.slice(-1) === "s" ? name.slice(0, -1) : name).toLowerCase();
// like it says on the tin
const filterFromReq = req => {
  const cat = singularLowerCase(req.query.selectedCategory || "Alls");
  return cat === "all" ? "" : `AND type = '${cat}'`;
};

const queryFileFromReq = req => {
  const featuredOnly =
    !req.query.query || (req.query.query || "").toLowerCase() === "featured";
  const resultType = (req.query.resultType || "").toLowerCase();
  let queryfile = SEARCH;
  if (featuredOnly && resultType === "map") {
    queryfile = FEATURED_MAP;
  } else if (featuredOnly) {
    queryfile = FEATURED;
  } else if (resultType == "map") {
    queryfile = SEARCH_MAP;
  }
  return queryfile;
};

const offsetFromReq = req => {
  const page = Math.max(as.number(req.query.page || 1), 1);
  return (page - 1) * limitFromReq(req);
};

const limitFromReq = req => {
  let limit = parseInt(req.query.limit || RESPONSE_LIMIT);
  const resultType = (req.query.resultType || "").toLowerCase();
  if (resultType === "map") {
    limit = 0; // return all
  }
  return limit;
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

router.get("/", async function(req, res) {
  const user_query = req.query.query || "";
  const parsed_query = preparse_query(user_query);
  const limit = limitFromReq(req);
  const lang = as.value(req.cookies.locale || "en");
  const params = parseGetParams(req, filterFromReq(req));
  try {
    const results = await db.any(queryFileFromReq(req), {
      query: parsed_query,
      filter: filterFromReq(req),
      limit: limit ? limit : null, // null is no limit in SQL
      offset: offsetFromReq(req),
      language: lang,
      userId: req.user ? req.user.id : null
    });
    const total = Number(
      results.length ? results[0].total || results.length : 0
    );
    const searchhits = results.filter(result => result.searchmatched).length;
    const pages = Math.max(limit ? Math.ceil(total / limit) : 1, 1); // Don't divide by zero limit, don't return page 1 of 1
    results.forEach(obj => {
      // massage results for display
      if (obj.photos.length) {
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
    if (req.accepts("json", "html") === "json") {
      returnType = "json";
    }
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
          user: req.user || null
        });
      case "htmlfrag":
        return res.status(200).render("home-search", {
          total,
          pages,
          searchhits,
          results,
          params,
          user: req.user || null
        });
      case "csv":
        return res.status(500, "CSV not implemented yet").render();
      case "xml":
        return res.status(500, "XML not implemented yet").render();
      case "html": // fall through
      default:
        return res.status(200).render("home-search", {
          OK,
          total,
          pages,
          searchhits,
          results,
          params,
          user: req.user || null
        });
    }
  } catch (error) {
    console.error("Error in search: ", error);
    console.trace(error);
    let OK = false;
    res.status(500).json({ OK, error });
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
      language: as.value(req.cookies.locale || "en"),
      limit: RESPONSE_LIMIT,
      offset: offset
    });
    const orgs = await db.any(LIST_MAP_ORGANIZATIONS, {
      language: as.value(req.cookies.locale || "en"),
      limit: RESPONSE_LIMIT,
      offset: offset
    });

    res.status(200).json({ data: { cases, orgs } });
  } catch (error) {
    log.error("Exception in GET /search/map", error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
