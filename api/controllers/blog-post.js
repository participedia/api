"use strict";
const express = require("express");
const router = express.Router();
let Parser = require('rss-parser');
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
// const feed = require('rss-to-json');
const logError = require("../helpers/log-error.js");
const { chunk } = require("lodash");

router.get("/", async (req, res) => {
  try {
    const rss = await parser.parseURL('https://medium.com/feed/@participediaproject');
    console.log('^^^^^^ rss.items.length ', rss.items.length)
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
        id: x.id,
        title: x.title,
        author: x.author,
        createdAt: x.created,
        description: content ? content.substring(0, 320) :" ",
        url: x.url,
        imageUrl: x.content.match(regEx) ? x.content.match(regEx)[1] : null
      };
    });

    return res.status(200).json({blogPosts: blogItems });
  } catch (error) {
    console.log('^^^^^^ blog posts error.status', error.status)
    console.log('^^^^^^ blog posts error.message', error.message)
    logError(error);
    return res.json({ success: false, error: error.message || error });
  }

  // feed.load("https://medium.com/feed/@participediaproject")
  //   .then(rss => {
  //     console.log('^^^^^^ rss.items.length ', rss.items.length)
  //     const chunkItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
  //     const regEx = /<img[^>]+src="?([^"\s]+)"?\s*\/>/;
      
  //     // there is a bug in the medium feed where the title for the first blog post
  //     // is returned with the content as well. As a stop gap bug fix i'm hardcoding 
  //     // the title here and removing it from the content so we don't see t
  //     // he duplicated title on the home page
  //     const duplicateTitleInContent = "<h3><strong>Governance Snapshots: <br>Adaptations, Innovations and Practitioner Learning in a Time of COVID-19</strong></h3>";

  //     const blogItems = chunkItems.map(x => {
  //       let content = x.content;
  //       if (x.content.indexOf(duplicateTitleInContent) === 0) {
  //         content = x.content.split(duplicateTitleInContent)[1];
  //       }
  //       return {
  //         id: x.id,
  //         title: x.title,
  //         author: x.author,
  //         createdAt: x.created,
  //         description: content.substring(0, 320),
  //         url: x.url,
  //         imageUrl: x.content.match(regEx) ? x.content.match(regEx)[1] : null
  //       };
  //     });
  //     res.status(200).json({
  //       blogPosts: blogItems
  //     });
  //   })
  //   .catch(error => {
  //     console.log('blog posts error', error)
  //     logError(error);
  //     res.json({ success: false, error: error.message || error });
  //   });
});

module.exports = router;