"use strict";
let express = require("express");
let router = express.Router();
const logError = require("../helpers/log-error.js");
let { db, FEATURED_COLLECTION, FEATURED } = require("../helpers/db");

function shuffle(array) {
  const shuffledArray = array.slice();
  console.log("shuffledArray[0].entryUrl", shuffledArray[0].entryUrl)
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function getHeroFeature() {
  return shuffle([
    {
      imageCredit: "Unknown",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/ee8da85d-d17e-4bfb-a500-0fc2e3dfd72a-In%20the%20Participatory%20Community%20Boards%20the%20plans%20presented%20by%20the%20Housing%20Institute%20are%20shaped.",
      entryTitle:
        'Participatory Slum Upgrading Process in the City of Buenos Aires: The "Villa 20" Case',
      entryUrl: "/case/5988",
    },
    {
      imageCredit: "Unknown",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/b5294e0a-e875-4ece-afe1-a242f851a5c3",
      entryTitle:
        "Decommissioning South African Social Services: Participatory Field Research in Delft",
      entryUrl: "/case/5834",
    },
    {
      imageCredit: "Max Bender",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/d97cf067-9b0b-4d80-bc38-aee5b8553c8c",
      entryTitle: "George Floyd Protests",
      entryUrl: "/case/6590",
    },
  ])[0];
}

async function getThingStatistic() {
  const stats = {
    cases: 0,
    methods: 0,
    organizations: 0
  };
  const results = await db.any("SELECT type, COUNT(*) as total FROM things WHERE type <> 'collection' GROUP BY type");
  results.map(result => {
    let type = `${result.type}s`;
    if (stats.hasOwnProperty(type)) {
      stats[type] = parseInt(result.total);
    }
  });
  return stats;
}

async function getTotalCountries() {
  const results = await db.any("SELECT country FROM things WHERE type IN ('case', 'organization') and country <> '' GROUP BY country");
  let total = 0;
  if (results && results.length) {
    total = parseInt(results.length);
  }
  return total;
}

async function getTotalContributors() {
  const results = await db.any("SELECT user_id FROM authors GROUP BY user_id");
  let total = 0;
  if (results && results.length) {
    total = parseInt(results.length);
  }
  return total;
}

router.get("/", async function(req, res) {
  let returnType = req.query.returns;
  const language = req.cookies.locale || "en";
  const thingStatsResult = await getThingStatistic();
  const totalCounties = await getTotalCountries();
  const totalContributors = await getTotalContributors();
  const heroFeature = getHeroFeature();

  // Collect Statistics
  const stats = {
    cases: thingStatsResult.cases, // (total entries)
    methods: thingStatsResult.methods, // (total entries)
    organizations: thingStatsResult.organizations, // (total entries)
    countries: totalCounties, // (number of unique countries represented between cases and orgs)
    contributors: totalContributors, // (number of unique users who have created or edited an entry)
  };

  // Collect Featured Collections
  const featuredCollections = await db.any(FEATURED_COLLECTION, {
    language: language
  });

  // Collect Featured Things
  const featuredCasesMethodsOrgs = await db.any(FEATURED, {
    language: language,
    limit: 7,
    sortby: "post_date",
    type: "things",
    userId: req.user ? req.user.id : null,
    facets: "",
    offset: 1
  });

  // Populate response data
  const data = {
    featuredCasesMethodsOrgs: featuredCasesMethodsOrgs,
    featuredCollections: featuredCollections,
    stats: stats,
    heroFeature: heroFeature
  };

  switch (returnType) {
    case "json":
      return res.status(200).json({
        user: req.user || null,
        ...data
      });
    case "html": // fall through
    default:
      return res.status(200).render("home", {
        user: req.user || null,
        ...data,
      });
  }
});

module.exports = router;
