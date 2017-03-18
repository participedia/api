"use strict";
var express = require("express");
var router = express.Router();
var { db, sql } = require("../helpers/db");
var log = require("winston");

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
            var jtitlelist = {};
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

function query_nouns_by_type(res, objType, query, page, language, sortMethod) {
    db
        .any(sql("../sql/list_" + objType + "s.sql"), {
            query: query,
            sortMethod: sortMethod,
            language: language,
            limit: RESPONSE_LIMIT,
            offset: (page - 1) * RESPONSE_LIMIT
        })
        .then(function(objList) {
            res
                .status(200)
                .json({ results: [{ type: objType, hits: objList }] });
        })
        .catch(function(error) {
            log.error("Exception in GET /search/getAllForType", error);
            res.status(500).json({ error: error });
        });
}

function query_all_nouns(res, query, page, language, sortMethod) {
    // IMPLEMENT ME!
    db
        .task(t => {
            let query = ["case", "method", "organization"].map(objType => {
                return t.any(sql("../sql/list_" + objType + "s.sql"), {
                    language: language,
                    limit: RESPONSE_LIMIT,
                    offset: (page - 1) * RESPONSE_LIMIT
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

function get_nouns_by_type(res, objType, page, language) {
    db
        .any(sql("../sql/list_" + objType + "s.sql"), {
            language: language,
            limit: RESPONSE_LIMIT,
            offset: (page - 1) * RESPONSE_LIMIT
        })
        .then(function(objList) {
            res.status(200).json({ results: { type: objType, hits: objList } });
        })
        .catch(function(error) {
            log.error("Exception in GET /search/getAllForType", error);
            res.status(500).json({ error: error });
        });
}

function get_all_nouns(res, page, language) {
    // IMPLEMENT ME!
    db
        .task(t => {
            let query = ["case", "method", "organization"].map(objType => {
                return t.any(sql("../sql/list_" + objType + "s.sql"), {
                    language: language,
                    limit: RESPONSE_LIMIT,
                    offset: (page - 1) * RESPONSE_LIMIT
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
    let sortingMethod = req.query.sortingMethod || "chronological";
    let selectedCategory = req.query.selectedCategory || "All";
    let language = req.query.language || "en";
    let page = parseInt(req.query.page || 1);

    if (query) {
        if (query.indexOf(":") == -1) {
            body = body.query("match", "_all", query);
        } else {
            let parts = query.split(":", 2);
            body = body.query("match", parts[0], parts[1]);
        }
    }
    if (query) {
        switch (selectedCategory) {
            case "Cases":
                query_nouns_by_type(
                    res,
                    "case",
                    query,
                    page,
                    language,
                    sortingMethod
                );
                break;
            case "Organizations":
                query_nouns_by_type(
                    res,
                    "organization",
                    query,
                    page,
                    language,
                    sortingMethod
                );
                break;
            case "Methods":
                query_nouns_by_type(
                    res,
                    "method",
                    query,
                    page,
                    language,
                    sortingMethod
                );
                break;
            default:
                query_all_nouns(res, query, page, language, sortingMethod);
                break;
        }
    } else {
        switch (selectedCategory) {
            case "Cases":
                get_nouns_by_type(res, "case", page, language);
                break;
            case "Methods":
                get_nouns_by_type(res, "method", page, language);
                break;
            case "Organizations":
                get_nouns_by_type(res, "organization", page, language);
                break;
            default:
                get_all_nouns(res, page, language);
                break;
        }
    }
});

module.exports = router;
