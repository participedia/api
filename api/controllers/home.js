"use strict";
let express = require("express");
let router = express.Router();
const i18n = require("i18n");
const logError = require("../helpers/log-error.js");
let { db, FEATURED, CASE_BY_ID } = require("../helpers/db");

function shuffle(array) {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

async function getHeroFeatures(i18n) {
  return shuffle([
    {
      imageUrl: "/images/homepage/hero-map-static.png",
      entryTitle: i18n("Explore Cases & Organizations by Location"),
      entryUrl: "#map",
    },
    {
      imageCredit: "Housing Institute of Buenos Aires",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/ee8da85d-d17e-4bfb-a500-0fc2e3dfd72a-In%20the%20Participatory%20Community%20Boards%20the%20plans%20presented%20by%20the%20Housing%20Institute%20are%20shaped.",
      entryTitle: i18n("home_hero.feature.5988"),
      entryUrl: "/case/5988",
      entryId: 5988,
      country: "Argentina",
    },
    {
      imageCredit:
        "Research Team, University of the Western Cape: Professor Laurence Piper, Robyn Pasensie and Sondre Bailey",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/b5294e0a-e875-4ece-afe1-a242f851a5c3",
      entryTitle: i18n("home_hero.feature.5600"),
      entryUrl: "/case/5600",
      entryId: 5600,
      country: "South Africa",
    },
    {
      imageCredit: "Max Bender",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/d97cf067-9b0b-4d80-bc38-aee5b8553c8c",
      entryTitle: i18n("home_hero.feature.6590"),
      entryUrl: "/case/6590",
      entryId: 6590,
      country: "United States",
    },
  ]);
}

async function getThingStatistic() {
  const stats = {
    cases: 0,
    methods: 0,
    organizations: 0,
    collections: 0,
  };
  const results = await db.any(
    "SELECT type, COUNT(*) as total FROM things WHERE hidden = false GROUP BY type"
  );
  results.map(result => {
    let type = `${result.type}s`;
    if (stats.hasOwnProperty(type)) {
      stats[type] = parseInt(result.total);
    }
  });
  return stats;
}

async function getTotalCountries() {
  const results = await db.any(
    "SELECT country FROM things WHERE type IN ('case', 'organization') and country <> '' GROUP BY country"
  );
  let total = 0;
  if (results && results.length) {
    total = parseInt(results.length);
  }
  return total;
}

function addTextureImageIfNeeded(entries) {
  // add a texture placeholder if there are no images for an entry
  return entries.map(entry => {
    const newEntry = Object.assign(entry, {});
    if (newEntry.photos && newEntry.photos.length < 1) {
      newEntry.photos = [{ url: "/images/texture_3.svg" }];
    }
    return newEntry;
  });
}

router.get("/", async function(req, res) {
  let returnType = req.query.returns;
  const language = req.cookies.locale || "en";
  const thingStatsResult = await getThingStatistic();
  const totalCounties = await getTotalCountries();
  const heroFeatures = await getHeroFeatures(res.__);

  // Collect Statistics
  const stats = {
    cases: thingStatsResult.cases, // (total entries)
    methods: thingStatsResult.methods, // (total entries)
    organizations: thingStatsResult.organizations, // (total entries)
    collections: thingStatsResult.collections, // (total entries)
    countries: totalCounties, // (number of unique countries represented between cases and orgs)
  };

  // Collect Featured Things
  let featuredEntries = await db.any(FEATURED, {
    language: language,
    limit: 10,
    sortby: "post_date",
    type: "things",
    userId: req.user ? req.user.id : null,
    facets: "",
    offset: 1,
  });
  featuredEntries = addTextureImageIfNeeded(featuredEntries);
  const featuredCollections = featuredEntries.filter(
    entry => entry.type === "collection"
  );
  const featuredCasesMethodsOrgs = featuredEntries.filter(
    entry => entry.type !== "collection"
  );

  // Populate response data
  const data = {
    featuredCasesMethodsOrgs: featuredCasesMethodsOrgs,
    featuredCollections: featuredCollections,
    stats: stats,
    heroFeatures: heroFeatures,
  };

  switch (returnType) {
    case "json":
      return res.status(200).json({
        user: req.user || null,
        ...data,
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
