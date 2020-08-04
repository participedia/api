"use strict";
const express = require("express");
const router = express.Router();
const https = require('https');
const feed = require('rss-to-json');
const logError = require("../helpers/log-error.js");
const { chunk } = require("lodash");

router.get("/", async (req, res) => {
  feed.load("https://medium.com/feed/@participediaproject")
    .then(rss => {
      const blogItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
      res.status(200).json({
        success: true,
        status: "success",
        data: blogItems,
        message: "Retrieved ALL blogs from https://medium.com/feed/@participediaproject feed",
      });
    })
    .catch(error => {
      logError(error);
      res.json({ success: false, error: error.message || error });
    });
});

module.exports = router;