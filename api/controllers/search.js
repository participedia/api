"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let { db, sql } = require("../helpers/db");
let log = require("winston");

const RESPONSE_LIMIT = 30;

router.get("/getAllForType", function getAllForType(req, res) {
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
  db
    .any(sql("../sql/titles_for_" + objType + "s.sql"), {
      language: req.query.language || "en",
      limit: RESPONSE_LIMIT,
      offset: offset
    })
    .then(function(titlelist) {
      let jtitlelist = {};
      // FIXME: this is a dumb format but it is what front-end expects.
      // Switch both (and tests) to use array of {title: , id: } pairs.
      // Also, if we're going to use {OK: true, data: []} everywhere else
      // we should use it here too.
      titlelist.forEach(function(row) {
        jtitlelist[row.title] = parseInt(row[objType + "_id"]);
      });
      res.status(200).json(jtitlelist);
    })
    .catch(function(error) {
      log.error("Exception in GET /search/getAllForType", error);
      res.status(500).json({ error: error });
    });
});

function query_nouns_by_type(
  res,
  objType,
  query,
  facets,
  page,
  language,
  orderBy
) {
  db
    .any(sql("../sql/search_" + objType + "s.sql"), {
      query: query,
      facets: format_facet_string(facets, objType),
      order_by: orderBy,
      language: language,
      limit: RESPONSE_LIMIT,
      offset: (page - 1) * RESPONSE_LIMIT
    })
    .then(function(objList) {
      res.status(200).json({ results: [{ type: objType, hits: objList }] });
    })
    .catch(function(error) {
      log.error("Exception in GET /search/getAllForType", error);
      res.status(500).json({ error: error });
    });
}

function query_all_nouns(res, query, facets, page, language, orderBy) {
  db
    .task(t => {
      let query = ["case", "method", "organization"].map(objType => {
        return t.any(sql("../sql/search_" + objType + "s.sql"), {
          query: query,
          facets: format_facet_string(facets, objType),
          language: language,
          limit: RESPONSE_LIMIT,
          offset: (page - 1) * RESPONSE_LIMIT,
          order_by: orderBy
        });
      });
      return t.batch(query);
    })
    .then(function(objLists) {
      res.status(200).json({
        results: [
          {
            type: "case",
            hits: objList[0]
          },
          {
            type: "method",
            hits: objList[1]
          },
          {
            type: "organization",
            hits: objList[2]
          }
        ]
      });
    })
    .catch(function(error) {
      log.error("Exception in GET /search/getAllForType", error);
      res.status(500).json({ error: error });
    });
}

function get_nouns_by_type(res, objType, facets, page, language, orderBy) {
  db
    .any(sql("../sql/list_" + objType + "s.sql"), {
      facets: format_facet_string(facets, objType),
      language: language,
      limit: RESPONSE_LIMIT,
      offset: (page - 1) * RESPONSE_LIMIT,
      order_by: orderBy
    })
    .then(function(objList) {
      res.status(200).json({ results: [{ type: objType, hits: objList }] });
    })
    .catch(function(error) {
      log.error("Exception in GET /search/getAllForType", error);
      res.status(500).json({ error: error });
    });
}

function get_all_nouns(res, facets, page, language, orderBy) {
  // IMPLEMENT ME!
  db
    .task(t => {
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
    })
    .then(function(objLists) {
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
    })
    .catch(function(error) {
      log.error("Exception in GET /search/getAllForType", error);
      res.status(500).json({ error: error });
    });
}

function format_facet_string(facets, type) {
  // super-simple for now
  if (facets["location.country"]) {
    return "(" +
      type +
      "s).location.country = '" +
      facets["location.country"] +
      "' AND";
  } else if (facets["tag"]) {
    let sq = "( " +
      type +
      "s.tags @> array[" +
      facets["tag"].replace(/"/g, "'") +
      "] ) AND";
    log.info(sq);
    return sq;
  } else {
    return "";
  }
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
  let query = req.query.query;
  let facets = {};
  let sortingMethod = req.query.sortingMethod || "chronological";
  let selectedCategory = req.query.selectedCategory || "All";
  let language = req.query.language || "en";
  let page = parseInt(req.query.page || 1);

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
      facets["tag"] = query.split(":")[1];
      query = "";
    }
  }
  let orderBy = {
    alphabetical: "ORDER BY title",
    chronological: "ORDER BY updated_date DESC",
    featured: "ORDER BY featured, id"
  }[sortingMethod];
  if (query) {
    switch (selectedCategory) {
      case "Cases":
        query_nouns_by_type(
          res,
          "case",
          query,
          facets,
          page,
          language,
          orderBy
        );
        break;
      case "Organizations":
        query_nouns_by_type(
          res,
          "organization",
          query,
          facets,
          page,
          language,
          orderBy
        );
        break;
      case "Methods":
        query_nouns_by_type(
          res,
          "method",
          query,
          facets,
          page,
          language,
          orderBy
        );
        break;
      default:
        query_all_nouns(res, query, facets, page, language, orderBy);
        break;
    }
  } else {
    switch (selectedCategory) {
      case "Cases":
        get_nouns_by_type(res, "case", facets, page, language, orderBy);
        break;
      case "Methods":
        get_nouns_by_type(res, "method", facets, page, language, orderBy);
        break;
      case "Organizations":
        get_nouns_by_type(res, "organization", facets, page, language, orderBy);
        break;
      default:
        get_all_nouns(res, facets, page, language, orderBy);
        break;
    }
  }
});

module.exports = router;
