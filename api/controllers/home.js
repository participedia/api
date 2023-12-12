"use strict";
let express = require("express");
let router = express.Router();
const i18n = require("i18n");
const logError = require("../helpers/log-error.js");
let { db, FEATURED, CASE_BY_ID } = require("../helpers/db");
let Parser = require('rss-parser');
const { chunk } = require("lodash");

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
    "SELECT type, COUNT(*) as total FROM things WHERE hidden = false and published = true GROUP BY type"
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

let parser = new Parser({
  customFields:{
    item: [
      ['content:encoded', 'content'],
      ['dc:creator', 'author'],
      ['pubDate', 'createdAt'],
      ['link', 'url'],
    ]
  }
});

async function getBlogPosts() {
  try {
    const rss = await parser.parseURL('https://medium.com/feed/@participediaproject');
    const chunkItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
    const regEx = /<img[^>]+src="?([^"\s]+)"?\s*\/>/;
    // there is a bug in the medium feed where the title for the first blog post
    // is returned with the content as well. As a stop gap bug fix i'm hardcoding 
    // the title here and removing it from the content so we don't see t
    // he duplicated title on the home page
    const duplicateTitleInContent = "<h3><strong>Governance Snapshots: <br>Adaptations, Innovations and Practitioner Learning in a Time of COVID-19</strong></h3>";
    const blogItems = chunkItems.map(x => {
      let content = x.content;
      parser
      if (x.content && x.content.indexOf(duplicateTitleInContent) === 0) {
        content = x.content.split(duplicateTitleInContent)[1];
      }
      return {
        title: x.title,
        author: x.author,
        createdAt: x.created,
        description: content ? content.substring(0, 320) :" ",
        url: x.url,
        imageUrl: x.content.match(regEx) ? x.content.match(regEx)[1] : null
      };
    });

    if(blogItems && Array.isArray(blogItems) && blogItems.length > 3){
      return blogItems.slice(0, 3);
    }
    return blogItems;
  } catch (error) {
    console.log('^^^^^^ blog posts error.status', error.status)
    console.log('^^^^^^ blog posts error.message', error.message)
    logError(error);
    return [];
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
  const blogPosts = await getBlogPosts();

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
    emailNotVerified: req.cookies.verify_email,
    blogPosts: blogPosts
  };
  if(req.cookies.verify_email) {
    req.session.user_to_verify = req.cookies.verify_email;
    res.clearCookie('verify_email');
  }

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
