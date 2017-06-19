"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let { db, sql, as } = require("../helpers/db");
let log = require("winston");
const { supportedTypes } = require("../helpers/things");

const RESPONSE_LIMIT = 20;

/**
 *  Deprecated, use /list/* methods instead
 *
 */
router.get("/getAllForType", async function getAllForType(req, res) {
  try {
    let objType = req.query.objType.toLowerCase();
    let page = parseInt(req.query.page || 1);
    let offset = 0;
    let response_limit = RESPONSE_LIMIT;
    if (
      req.query.response_limit &&
      req.query.response_limit.toLowerCase() === "none"
    ) {
      response_limit = Number.MAX_SAFE_INTEGER;
    } else {
      response_limit = parseInt(req.query.response_limit || RESPONSE_LIMIT);
      offset = (page - 1) * response_limit;
    }
    if (!supportedTypes.includes(objType)) {
      res.status(401).json({
        message: "Unsupported objType for getAllForType: " + objType
      });
    }
    const titlelist = await db.any(sql("../sql/titles_for_things.sql"), {
      language: as.value(req.query.language || "en"),
      limit: RESPONSE_LIMIT,
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
const singularLowerCase = name => name.slice(0, -1).toLowerCase();
// like it says on the tin
const filterFromReq = req => {
  const cat = singularLowerCase(req.query.selectedCategory || "Alls");
  return cat === "all" ? "" : `AND type = '${cat}'`;
};

const queryFileFromReq = req => {
  const featuredOnly = !req.query.query ||
    (req.query.query || "").toLowerCase() === "featured";
  const resultType = (req.query.resultType || "").toLowerCase();
  let queryfile = "../sql/search.sql";
  if (featuredOnly && resultType === "map") {
    queryfile = "../sql/featuredmap.sql";
  } else if (featuredOnly) {
    queryfile = "../sql/featured.sql";
  } else if (resultType == "map") {
    queryfile = "../sql/searchmap.sql";
  }
  return queryfile;
};

const offsetFromReq = req => {
  const page = as.number(req.query.page || 1);
  return (page - 1) * RESPONSE_LIMIT;
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

// two factors for search: if there is a selectecCategory then filter by it, always
// if there is no query OR the query is "featured" then return all featured items
// One further item: need an alternative search which returns only map-level items and has no pagination

router.get("/", async function(req, res) {
  try {
    const objList = await db.any(sql(queryFileFromReq(req)), {
      query: req.query.query,
      language: as.value(req.query.language || "en"),
      filter: filterFromReq(req),
      limit: RESPONSE_LIMIT,
      offset: offsetFromReq(req),
      userId: req.user ? req.user.user_id : null
    });
    const total = Number(objList.length ? objList[0].total || 0 : 0);
    const pages = Math.ceil(total / RESPONSE_LIMIT);
    objList.forEach(obj => delete obj.total);
    res
      .status(200)
      .json({ OK: true, total: total, pages: pages, results: objList });
  } catch (error) {
    console.error("Error in search: ", error);
    console.trace(error);
    res.status(500).json({ error: error });
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
    const cases = await db.any(sql("../sql/list_map_cases.sql"), {
      language: as.value(req.query.language || "en"),
      limit: RESPONSE_LIMIT,
      offset: offset
    });
    const orgs = await db.any(sql("../sql/list_map_orgs.sql"), {
      language: as.value(req.query.language || "en"),
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
