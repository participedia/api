const express = require("express");
/* eslint-disable new-cap */
const router = express.Router();
/* eslint-enable new-cap */
const es = require("../helpers/es");
const AWS = require("aws-sdk");
const log = require("winston");
const Bodybuilder = require("bodybuilder");

router.get("/getAllForType", (req, res) => {
  const objType = req.query.objType.toLowerCase();
  if (
    objType !== "organization" && objType !== "case" && objType !== "method"
  ) {
    res
      .status(401)
      .json({ message: `Unsupported objType for getAllForType: ${objType}` });
  }
  const params = {
    TableName: `pp_${objType}s`,
    IndexName: `title_en-index`
  };
  const docClient = new AWS.DynamoDB.DocumentClient();
  try {
    docClient.scan(params, (err, data) => {
      if (err) {
        log.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        const titles = {};
        data.Items.forEach(item => {
          titles[item.title_en] = Number(item.id);
        });
        res.json(titles);
      }
    });
  } catch (e) {
    log.error(`Exception in /getAllForType: ${e}`);
  }
});

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
 *          ... (ElasticSearch records) ...
 *       }
 *     }
 *
 */

// Should not return things that aren't displayable as SearchHits (i.e. Users...)

router.get("/", (req, res) => {
  let body = new Bodybuilder();
  const query = req.query.query;
  let sortingMethod = req.query.sortingMethod;
  let selectedCategory = req.query.selectedCategory;
  if (!sortingMethod) {
    sortingMethod = "chronological";
  }
  if (!selectedCategory) {
    selectedCategory = "All";
  }

  if (query) {
    log.info(query.indexOf(":"));
    if (query.indexOf(":") === -1) {
      body = body.query("match", "_all", query);
    } else {
      const parts = query.split(":", 2);
      body = body.query("match", parts[0], parts[1]);
    }
  }
  if (sortingMethod === "chronological") {
    body = body.sort("lastmodified", "desc");
  } else {
    body = body.sort("id", "asc"); // Note this requires a non-analyzed field
  }
  const bodyquery = body.size(30).build("v2");
  const includeCases = selectedCategory === "All" ||
    selectedCategory === "Cases";
  const includeMethods = selectedCategory === "All" ||
    selectedCategory === "Methods";
  // let includeNews = selectedCategory === 'All' || selectedCategory === 'News'
  const includeOrgs = selectedCategory === "All" ||
    selectedCategory === "Organizations";

  if (query) {
    const promises = [];
    if (includeCases) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "case",
            body: bodyquery
          })
          .then(result => ({ type: "case", hits: result.hits.hits }))
      );
    }
    if (includeOrgs) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "organization",
            body: bodyquery
          })
          .then(result => ({ type: "organization", hits: result.hits.hits }))
      );
    }
    if (includeMethods) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "method",
            body: bodyquery
          })
          .then(result => ({ type: "method", hits: result.hits.hits }))
      );
    }
    Promise.all(promises).then(
      results => {
        res.json({ results });
      },
      error => {
        log.error("error", error);
        res.status(500).json(error);
      }
    );
  } else {
    const promises = [];
    if (includeCases) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "case",
            match_all: {}
          })
          .then(result => ({ type: "case", hits: result.hits.hits }))
      );
    }
    if (includeOrgs) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "organization",
            match_all: {}
          })
          .then(result => ({ type: "organization", hits: result.hits.hits }))
      );
    }
    if (includeMethods) {
      promises.push(
        es
          .search({
            index: "pp",
            type: "method",
            match_all: {}
          })
          .then(result => ({ type: "method", hits: result.hits.hits }))
      );
    }
    Promise.all(promises).then(
      results => {
        res.json({ results });
      },
      error => {
        log.error("error", error);
        res.status(500).json(error);
      }
    );
  }
});

module.exports = router;
