"use strict";
let express = require("express");
let router = express.Router();
const logError = require("../helpers/log-error.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomHeroFeature() {
  const heroFeatures = [
    {
      imageCredit: "unknown",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/ee8da85d-d17e-4bfb-a500-0fc2e3dfd72a-In%20the%20Participatory%20Community%20Boards%20the%20plans%20presented%20by%20the%20Housing%20Institute%20are%20shaped.",
      entryTitle:
        'Participatory Slum Upgrading Process in the City of Buenos Aires: The "Villa 20" Case',
      entryUrl: "/case/5988",
    },
    {
      imageCredit: "unknown",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/b5294e0a-e875-4ece-afe1-a242f851a5c3",
      entryTitle:
        "Decommissioning South African Social Services: Participatory Field Research in Delft",
      entryUrl: "/case/5834",
    },
    {
      imageCredit: "Max Bender",
      imageUrl:
        "https://s3.amazonaws.com/participedia.prod/d117cf067-9b0b-4d80-bc38-aee5b8553c8c",
      entryTitle: "George Floyd Protests",
      entryUrl: "/case/6590",
    },
  ];

  const randomIndex = getRandomInt(heroFeatures.length);
  return heroFeatures[0];
}

// placeholder data for development
const data = {
  stats: {
    cases: 1455, // (total entries)
    methods: 324, // (total entries)
    organizations: 667, // (total entries)
    countries: 120, // (number of unique countries represented between cases and orgs)
    contributors: 810, // (number of unique users who have created or edited an entry)
  },
  heroFeature: getRandomHeroFeature(),
  featuredCollections: [
    {
      id: 6493,
      type: "collection",
      featured: true,
      title: "Government of Canada",
      description:
        "Entries in this collection—prepared by the Consultations and Public Engagement unit of Canada’s Privy Council Office—describe objectives, methods, implementation, and outcomes of Canadian examples of public engagement that have been designed to inform governance.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/b1e02fff-62ea-4e48-a465-08224a433cfa",
          source_url:
            "https://www.thecanadianencyclopedia.ca/en/article/federal-government",
          attribution: "",
          title: "govcanada.jpg",
        },
      ],
      updated_date: "2020-06-14T17:39:56.128Z",
      post_date: "2020-04-30T00:00:00.000Z",
    },
    {
      id: 6580,
      type: "collection",
      title: "Public Participation for Racial Justice",
      description:
        "This collection includes diverse forms of public participation for securing racial justice, such as protests, advocacy campaigns, community organizing, and shared governance through an explicit racial equity lens. Photo credit: Johnny Silvercloud on Flickr",

      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/0eed21ad-5351-4094-9dbe-15dc2e26a911",
          source_url:
            "https://www.flickr.com/photos/johnnysilvercloud/28476745294",
          attribution: "Johnny Silvercloud / Flickr",
          title: "Demilitarize the Police, Black Lives Matter",
        },
      ],
    },
    {
      id: 6499,
      type: "collection",
      title: "Covid-19 Response",
      description:
        "This collection includes diverse forms of public participation that address the Covid-19 pandemic, ranging from protests & volunteering to hackathons & distributed computing. These entries are crowdsourced and collaboratively written by Participedia’s community of wiki contributors.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/6a03edfd-9869-4e3e-aaf8-2ef707a4c89f",
          source_url: "",
          attribution: "",
          title: "NicoloCampo-GettyImages-viaBBC.jpg",
        },
      ],
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
