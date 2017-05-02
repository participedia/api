"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let { db, sql, as } = require("../helpers/db");
let log = require("winston");

const RESPONSE_LIMIT = 20;

router.get("/getAllForType", async function getAllForType(req, res) {
  try {
    let objType = req.query.objType.toLowerCase();
    let page = parseInt(req.query.page || 1);
    let offset = (page - 1) * RESPONSE_LIMIT;
    if (
      objType !== "organization" && objType !== "case" && objType !== "method"
    ) {
      res.status(401).json({
        message: "Unsupported objType for getAllForType: " + objType
      });
    }
    const titlelist = await db.any(
      sql("../sql/titles_for_" + objType + "s.sql"),
      {
        language: as.value(req.query.language || "en"),
        limit: RESPONSE_LIMIT,
        offset: offset
      }
    );
    let jtitlelist = {};
    // FIXME: this is a dumb format but it is what front-end expects.
    // Switch both (and tests) to use array of {title: , id: } pairs.
    // Also, if we're going to use {OK: true, data: []} everywhere else
    // we should use it here too.
    titlelist.forEach(function(row) {
      jtitlelist[row.title] = parseInt(row[objType + "_id"]);
    });
    res.status(200).json(jtitlelist);
  } catch (error) {
    log.error("Exception in GET /search/getAllForType", error);
    res.status(500).json({ error: error });
  }
});

const get_nouns_by_type = async (
  res,
  objType,
  facets,
  page,
  language,
  orderBy
) => {
  try {
    const objList = await db.any(sql("../sql/list_" + objType + "s.sql"), {
      facets: format_facet_string(facets, objType),
      language: language,
      limit: RESPONSE_LIMIT,
      offset: (page - 1) * RESPONSE_LIMIT,
      order_by: orderBy
    });
    res.status(200).json({ results: [{ type: objType, hits: objList }] });
  } catch (error) {
    log.error("Exception in GET /search/getAllForType", error);
    res.status(500).json({ error: error });
  }
};

const get_all_nouns = async (res, facets, page, language, orderBy) => {
  try {
    const objLists = await db.task(t => {
      let query = ["case", "method", "organization"].map(objType => {
        return t.any(sql("../sql/list_" + objType + "s.sql"), {
          facets: format_facet_string(facets, objType),
          language: language,
          limit: RESPONSE_LIMIT,
          offset: (page - 1) * RESPONSE_LIMIT,
          order_by: orderBy
        });
      });
      return t.batch(query);
    });
    res.status(200).json({
      results: [
        {
          type: "case",
          hits: objLists[0]
        },
        {
          type: "method",
          hits: objLists[1]
        },
        {
          type: "organization",
          hits: objLists[2]
        }
      ]
    });
  } catch (error) {
    log.error("Exception in GET /search/getAllForType", error);
    res.status(500).json({ error: error });
  }
};

function format_facet_string(facets, type) {
  // super-simple for now
  if (facets["location.country"]) {
    let country = as.text(facets["location.country"]);
    return `(${type}s).location.country = ${country} AND`;
  } else if (facets.tag) {
    let tag = as.text(facets.tag);
    return `(${type}s.tags @> array[${tag}]) AND`;
  } else {
    return "";
  }
}

// strip off final character (assumed to be "s")
const singularLowerCase = name => name.slice(0, -1).toLowerCase();

function parseSearchReq(req) {
  let query = req.query.query;
  let facets = {};
  const sortingMethod = req.query.sortingMethod || "chronological";
  const category = singularLowerCase(req.query.selectedCategory || "Alls");
  const language = as.value(req.query.language || "en");
  const page = as.number(req.query.page || 1);
  // handle faceted queries
  // currently only faceted query is "geo_country" and tags
  // for more facets, and mixing facets with query terms
  // we'll need a more capable query parser

  if (query) {
    if (query.indexOf("geo_country") > -1) {
      facets["location.country"] = query.split(":")[1];
      query = "";
    }
    if (query.indexOf("tag") > -1) {
      facets.tag = query.split(":")[1];
      // Multiple words OK, but strip off surrounding quotes before matching
      if (/^".*"$/.test(facets.tag)) {
        facets.tag = facets.tag.slice(1, -1);
      }
      query = "";
    }
  }

  const orderBy = {
    alphabetical: "ORDER BY title",
    chronological: "ORDER BY updated_date DESC",
    featured: "ORDER BY featured, id"
  }[sortingMethod];

  const lang = language;

  return { query, facets, orderBy, category, lang, page };
}

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

router.get("/", function(req, res) {
  try {
    const { query, facets, orderBy, category, lang, page } = parseSearchReq(
      req
    );
    if (query) {
      full_text_search(res, query, lang, page);
    } else {
      // no query
      if (["case", "method", "organization"].includes(category)) {
        get_nouns_by_type(res, category, facets, page, lang, orderBy);
      } else {
        // no category selected, get across all categories
        get_all_nouns(res, facets, page, lang, orderBy);
      }
    }
  } catch (error) {
    console.error("Error in search: ", error);
    res.status(500).json({ error: error });
  }
});

/**
 * @api {get} /search/v2 Search through the cases
 * @apiGroup Search
 * @apiVersion 0.1.0
 * @apiName search
 *
 * @apiParam  {String} query query term(s)
 * @apiParam  {String} language language
 * @apiParam  {Number} page
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object[]} list of matching objects
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

async function full_text_search(res, query, language, page) {
  try {
    const objList = await db.any(sql("../sql/search.sql"), {
      query: query,
      language: language,
      limit: RESPONSE_LIMIT,
      offset: (page - 1) * RESPONSE_LIMIT
    });
    res.status(200).json({ OK: true, results: objList });
  } catch (error) {
    log.error("Exception in GET /search/v2/", error);
    res.status(500).json({ OK: false, error: error });
  }
}

const get_map_data = async (req, res) => {
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
};

router.get("/map", function(req, res) {
  try {
    get_map_data(req, res);
  } catch (error) {
    console.error("Error in search/map: ", error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
