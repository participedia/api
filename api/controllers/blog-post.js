"use strict";
const express = require("express");
const router = express.Router();
const https = require('https');
const feed = require('rss-to-json');


router.get("/", async (req, res) => {
  feed.load('https://medium.com/feed/@participediaproject').then(rss => {
    res.status(200).json(rss.items);
  });
});

module.exports = router;