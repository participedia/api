"use strict";
let express = require("express");
let router = express.Router();
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

async function getLocalizedEntryTitles() {
  const caseIdsByEnv = {
    production: [5988, 5600, 6590],
    development: [4772, 4242],
    staging: [4772, 4242],
    "homepage-2020": [5988, 5600, 6590],
  };
  if (caseIdsByEnv[process.env.NODE_ENV]) {
    const promises = caseIdsByEnv[process.env.NODE_ENV].map(async id => {
      try {
        const localizedTitles = await db.many(
          `select thingid, language, title from localized_texts where thingid = ${id};`
        );
        return localizedTitles[0];
      } catch (err) {
        console.warn("Error fetching hero features", err);
      }
    });
    return await Promise.all(promises);
  } else {
    return null;
  }
}

async function getHeroFeatures() {
  const features = [
    {
      imageUrl: "/images/homepage/hero-map-static.png",
      entryTitle: "Explore Cases & Organizations by Location",
      entryUrl: "#map",
    },
    {
      imageCredit: "Housing Institute of Buenos Aires",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/ee8da85d-d17e-4bfb-a500-0fc2e3dfd72a-In%20the%20Participatory%20Community%20Boards%20the%20plans%20presented%20by%20the%20Housing%20Institute%20are%20shaped.",
      entryTitle:
        'Participatory Slum Upgrading Process in the City of Buenos Aires: The "Villa 20" Case',
      entryUrl: "/case/5988",
      entryId: 5988,
      country: "Argentina",
    },
    {
      imageCredit:
        "Research Team, University of the Western Cape: Professor Laurence Piper, Robyn Pasensie and Sondre Bailey",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/b5294e0a-e875-4ece-afe1-a242f851a5c3",
      entryTitle:
        "Participatory Research on the Decommissioning of South African Social Services",
      entryUrl: "/case/5600",
      entryId: 5600,
      country: "South Africa",
    },
    {
      imageCredit: "Max Bender",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/d97cf067-9b0b-4d80-bc38-aee5b8553c8c",
      entryTitle: "George Floyd Protests",
      entryUrl: "/case/6590",
      entryId: 6590,
      country: "United States",
    },
  ];

  const localizedTitles = await getLocalizedEntryTitles();

  let localizedTitlesById = {};
  if (localizedTitles) {
    localizedTitles.forEach(item => {
      const newItem = {};
      newItem[item.thingid] = item;
      return newItem;
    });
  }

  // use localized titles
  const featuredArticles = features.map(feature => {
    if (feature.entryId && localizedTitlesById[feature.entryId]) {
      feature.entryTitle = localizedTitlesById[feature.entryId].title;
    }
    return feature;
  });
  return shuffle(featuredArticles);
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
  const heroFeatures = await getHeroFeatures();

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
    limit: 7,
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
