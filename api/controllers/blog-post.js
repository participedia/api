"use strict";
const express = require("express");
const router = express.Router();
const https = require('https');
const feed = require('rss-to-json');
const { chunk } = require("lodash");

router.get("/", async (req, res) => {
  feed.load('https://medium.com/feed/@participediaproject').then(rss => {
    const blogItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
    res.status(200).json(blogItems);
  });
});

module.exports = router;