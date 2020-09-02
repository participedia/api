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
  featuredCasesMethodsOrgs: [
    {
      id: 5515,
      type: "case",
      title: "Advancing Women’s Rights in Nicaragua’s Farming Cooperatives",
      description:
        "A gender audit of the National Federation of Cooperatives found women in Nicaragua lacked access to land. Reforms of the association and the development of a Women’s Land Fund increased women’s representation and participation.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/3fe9ac66-d298-4721-88ee-eac81f55453f_coffee-women-MAIN.jpg",
          source_url: "http://bit.ly/2CZZ1tU",
          attribution: "Simon Rawles/Getty Images",
          title: "",
        },
      ],
    },
    {
      id: 5383,
      type: "case",
      title: "Vorarlberg Citizen Council on Asylum and Refugee Policies",
      description:
        "Using the unique, homegrown citizens' council method, Vorarlberg looked to its citizens in addressing the issue of refugee and asylum integration. The three-phase process gave officials valuable feedback regarding local participation in the resettlement process.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/6cf8243e-6ce4-4502-89af-1d132992f512",
          source_url: "https://vimeo.com/135618811",
          attribution: "Martin Rausch",
          title: "Participants in the Civic Council discuss their ideas",
        },
      ],
    },
    {
      id: 6573,
      type: "case",
      title:
        "Deliberative Consultation on Trade-offs Related to Using 'COVIDSafe' Contact Tracing Technology",
      description:
        "This project explores the trade-offs in using contact tracing technology to manage the risk of community transmission of SARS-CoV-2. Participants will make recommendations on how contact tracing technology should and shouldn't be used as a precondition for re-opening organisations and businesses.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/8b5d9aa9-771c-404d-bf55-18b6e2cf120a",
          source_url:
            "https://www.health.gov.au/resources/apps-and-tools/covidsafe-app",
          attribution: "",
          title: "COVIDSafe App Logo",
        },
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/972a1fdc-244f-4502-bf35-71b2a0ad0185",
          source_url: "",
          attribution: "",
          title:
            "Australian Centre for Health Engagement Evidence and Values (ACHEEV)",
        },
      ],
    },
    {
      id: 5450,
      type: "method",
      completeness: "complete",
      featured: false,
      title: "National Public Policy Conferences (Brazil)",
      description:
        "National Public Policy Conferences are a participatory methodology involving deliberation which is used for citizens to engage in formulating public policy at the state level in Brazil.",
      body:
        '<h2>Problems and Purpose</h2><p>The national public policy conferences (conferências nacionais de políticas públicas), are arguably the largest and most innovative participatory experience currently being held in Brazil. The national conferences consist of spheres of <a href="https://participedia.xyz/method/560" target="_blank">deliberation</a> and participation designed to provide guidelines for the formulation of public policy by the public policy councils at the federal level. They are summon',
      location_name: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      latitude: null,
      longitude: null,
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/059c09c8-a8fe-4cf0-86b6-6dfaac382360_33710542_1741042065977156_2440836245098594304_o.jpg",
          source_url: "",
          attribution: "Direitos Humanos Brasil Facebook",
          title: "Brazil Human Rights Conference",
        },
      ],
      videos: [],
      updated_date: "2020-09-01T00:00:00.000Z",
      post_date: "2010-09-29T00:00:00.000Z",
      bookmarked: false,
    },
    {
      id: 5149,
      type: "method",
      completeness: "complete",
      featured: false,
      title: "Microfinance",
      description:
        "Micro-financing encompasses a broad category, with the common design of expanding access to financial services in under-serviced and disadvantaged communities, thereby fostering empowerment and development.",
      body:
        "<h2>Problems and Purpose</h2><p>Microfinance encompasses a broad category of financial products and services offered to poor or socially marginalized individuals. Unlike other products and services under the banner of 'alternative financial institutions', microfinance typically serves those living in poor countries or communities lacking access to \"high-quality financial products and services, including not just credit but also savings, insurance, payment services, and fund transfers.\"[1]&nbsp;<",
      location_name: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      latitude: null,
      longitude: null,
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/d5fee3be-0149-43cb-a4d7-e6cf0683eaa2_10452843_10152282562113403_145127855782863785_o.jpg",
          source_url: "",
          attribution: "",
          title: "",
        },
      ],
      videos: [
        {
          url: "https://www.youtube.com/watch?v=bpSNM625LFU",
          attribution: "",
          title: "A short introduction to microfinance",
        },
      ],
      updated_date: "2020-08-31T00:00:00.000Z",
      post_date: "2017-12-04T00:00:00.000Z",
      bookmarked: false,
    },
    {
      id: 145,
      type: "method",
      completeness: "complete",
      featured: false,
      title: "21st Century Town Meeting®",
      description:
        "21st Century Town Meetings® are public forums that use modern communications technologies to allow large number of participants across various locations to simultaneously deliberate on the same issue in small groups. ",
      body:
        '<h2>Problems and Purpose</h2><p>The 21st Century Town Meeting method was developed by <a href="https://participedia.net/organization/199" target="_blank">AmericaSpeaks</a> to increase the number of participants without decreasing the quality of dialogue and <a href="https://participedia.net/method/560" target="_blank">deliberation</a>. The method was conceived in an attempt to \'update\' the <a href="https://participedia.net/method/159" target="_blank">New England Town Meeting</a> format for the d',
      location_name: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      latitude: null,
      longitude: null,
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/55d928c9-be96-4307-bda1-c1df57394dae_town-meeting-11.jpg",
          source_url: "https://goo.gl/kRw4a1",
          attribution: "Museums Commons",
          title: "Climate Change 21st century Town Meeting",
        },
      ],
      videos: [],
      updated_date: "2020-08-31T00:00:00.000Z",
      post_date: "2009-07-29T00:00:00.000Z",
      bookmarked: true,
    },
    {
      id: 6900,
      type: "organization",
      title: "Asset",
      description:
        "Asset is the new regional agency dedicated, as public engineering, to strategic planning, integrated programming, design and implementation of public works",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/6d3e35eb-0e87-43f7-9524-f5d06e4fbf5b",
          source_url:
            "http://asset.regione.puglia.it/assets/images/news/DSC02888.jpg",
          attribution: "Asset",
          title: "asset1.JPG",
        },
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/c5b320d8-0703-45f3-a36e-7a5362da6e8f",
          source_url:
            "http://asset.regione.puglia.it/assets/images/news/Immagine.png",
          attribution: "Asset",
          title: "asset2.JPG",
        },
      ],
    },
    {
      id: 6897,
      type: "organization",
      completeness: "stub",
      featured: false,
      title: "Sustainable Development Institute (SDI)",
      description:
        "The Sustainable Development Institute (SDI) works to transform decision-making processes of natural resource management so the benefits are shared equally. SDI's work aims to create space for the participation of local communities in decision making processes on natural resources.",
      photos: [
        {
          url:
            "https://s3.amazonaws.com/participedia.prod/a2af57cb-8b23-4094-9cba-5e60190d96c5",
          source_url:
            "https://goodpitch.org/uploads/cache/org_image/max_600_400_sdi_log.jpg",
          attribution: "",
          title: "Sustainable Development Institute logo",
        },
      ],
    },
    {
      id: 6578,
      type: "organization",
      title: "Australian Centre for Health Engagement, Evidence and Values",
      description:
        "Innovative social research - Making health systems and decisions more inclusive and democratic.",
      photos: [
        {
          url: "/images/texture_6.svg",
        },
      ],
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
