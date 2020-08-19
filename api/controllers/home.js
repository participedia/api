"use strict";
let express = require("express");
let router = express.Router();
const logError = require("../helpers/log-error.js");

// placeholder data for development
const data = {
  stats: {
    cases: 1455, // (total entries)
    methods: 324, // (total entries)
    organizations: 667, // (total entries)
    countries: 120, // (number of unique countries represented between cases and orgs)
    contributors: 810, // (number of unique users who have created or edited an entry)
  },
  heroFeatures: [
    {
      imageCredit: "Manuel Peris Tirado",
      imageUrl: "https://s3.amazonaws.com/participedia.prod/99810ed7-0c9c-4871-adc7-aab8298b4ab7",
      entryTitle: "Mass Singing during the COVID-19 Pandemic",
      entryUrl: "https://participedia.net/case/6431",
    },
  ],
  featuredCollections: [
    {
      imageUrl: "",
      title: "",
      description: "",
      url: "",
    },
  ],
  featuredCases: [
    {
      imageUrl: "",
      title: "",
      description: "",
      url: "",
      postDate: "",
    },
  ],
  featuredMethods: [
    {
      imageUrl: "",
      title: "",
      description: "",
      url: "",
      postDate: "",
    },
  ],
  featuredOrganizations: [
    {
      imageUrl: "",
      title: "",
      description: "",
      url: "",
      postDate: "",
    },
  ],
  blogPosts: [
    {
      id: "",
      title: "",
      author: "",
      createdAt: 1568911370000,
      description: "",
      url: "",
      imageUrl: "",
    },
  ],
};

router.get("/", async function(req, res) {
  let returnType = req.query.returns;

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
