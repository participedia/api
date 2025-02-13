"use strict";
let express = require("express");
let router = express.Router();
let { db, FEATURED } = require("../helpers/db");

function shuffle(array) {
  const shuffledArray = array.slice();
  try {
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
    
  } catch (error) {
    return shuffledArray;
  }
}

async function getHeroFeatures(i18n) {
  return shuffle([
    {
      imageUrl: "/images/homepage/hero-map-static.png",
      entryTitle: i18n("Explore Cases & Organizations by Location"),
      entryUrl: "/search?selectedCategory=case&layout=maps",
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
      imageUrl: "/images/homepage/transnational-citizens-assemblies.jpeg",
      entryTitle: i18n("home_hero.feature.8376"),
      entryUrl: "/collection/8376",
      entryId: 8376,
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
  try {
    const results = await db.any(
      "SELECT type, COUNT(*) as total FROM things WHERE hidden = false and published = true GROUP BY type"
    );
    results.map(result => {
      let type = `${result.type}s`;
      if (stats.hasOwnProperty(type)) {
        stats[type] = parseInt(result.total);
      }
    });
    return stats;
    
  } catch (error) {
    return stats;
  }
}

async function getTotalCountries() {
  try {
    const results = await db.any(
      "SELECT country FROM things WHERE type IN ('case', 'organization') and country <> '' GROUP BY country"
    );
    let total = 0;
    if (results && results.length) {
      total = parseInt(results.length);
    }
    return total;
  } catch (error) {
    return 0;
  }
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

  try {
    // Collect Featured Things
    let featuredEntries = await db.any(FEATURED, {
      language: language,
      limit: 10,
      sortby: "post_date",
      type: "things",
      userId: req.user ? req.user.id : null,
      facets: "",
      offset: 0,
    });
    featuredEntries = addTextureImageIfNeeded(featuredEntries);
    const featuredCollections = featuredEntries.filter(
      entry => entry.type === "collection" && entry.featured === true
    );
    const featuredCasesMethodsOrgs = featuredEntries.filter(
      entry => entry.type !== "collection" && entry.featured === true
    );
  
    // Populate response data
    const data = {
      featuredCasesMethodsOrgs: featuredCasesMethodsOrgs,
      featuredCollections: featuredCollections,
      stats: stats,
      heroFeatures: heroFeatures,
      emailNotVerified: req.cookies.verify_email
    };
    if(req.cookies.verify_email) {
      req.session.user_to_verify = req.cookies.verify_email;
      res.clearCookie('verify_email');
    }
  
    switch (returnType) {
      case "json":{
        return res.status(200).json({
          user: req.user || null,
          ...data,
        });
      }
      case "html": // fall through
      default: {
        return res.status(200).render("home", {
          user: req.user || null,
          ...data,
        });
      }
    }
    
  } catch (error) {
    res.status(404).render("404");
  }
});

module.exports = router;
