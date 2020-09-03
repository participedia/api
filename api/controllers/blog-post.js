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
      const chunkItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
      const regEx = /<img[^>]+src="?([^"\s]+)"?\s*\/>/;
      const blogItems = chunkItems.map(x => {
        return {
          id: x.id,
          title: x.title,
          author: x.author,
          createdAt: x.created,
          description: x.content.substring(0, 320),
          url: x.url,
          imageUrl: x.content.match(regEx) ? x.content.match(regEx)[1] : null
        };
      });
      res.status(200).json({
        blogPosts: blogItems
      });
    })
    .catch(error => {
      logError(error);
      res.json({ success: false, error: error.message || error });
    });
});

module.exports = router;