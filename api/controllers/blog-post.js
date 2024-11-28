"use strict";
const express = require("express");
const router = express.Router();
let { db, as, UPSERT_MEDIUM_POST, MEDIUM_POSTS } = require("../helpers/db");


const RSSParser = require('rss-parser');
const parser = new RSSParser();
const logError = require("../helpers/log-error.js");
const { chunk } = require("lodash");


function mapPost(post) {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    createdAt: post.created_at,
    description: post.description,
    url: post.url,
    imageUrl: post.imageurl
  };
}

async function getMediumPosts() {
  try {
    const posts = await db.any(MEDIUM_POSTS);
    return posts.map(post => mapPost(post));
  } catch (error) {
    return null;
  }
}


async function upsertMediumPosts(blogPosts) {
  try {
    if(blogPosts && Array.isArray(blogPosts)){
      const posts = blogPosts.length > 3 ? blogPosts.slice(0, 3) : blogPosts;
      for(let i = 0; i < posts.length; i++){
       await db.none(UPSERT_MEDIUM_POST, posts[i]);
      }
    }
  } catch (error) {
    console.log('upsertMediumPosts error ', error)
  }
}

router.get("/", async (req, res) => {
  const feedUrl = 'https://medium.com/feed/@participediaproject';
  try {
    const rss = await parser.parseURL(feedUrl);

    // Chunk items and process
    const chunkItems = rss.items.length > 0 ? chunk(rss.items, 10)[0] : [];
    const regEx = /<img[^>]+src="?([^"\s]+)"?\s*\/>/;
      
    // there is a bug in the medium feed where the title for the first blog post
    // is returned with the content as well. As a stop gap bug fix i'm hardcoding 
    // the title here and removing it from the content so we don't see t
    // he duplicated title on the home page
    const duplicateTitleInContent = "<h3><strong>Governance Snapshots: <br>Adaptations, Innovations and Practitioner Learning in a Time of COVID-19</strong></h3>";

    const blogItems = chunkItems.map(x => {
        let content = x.content || x['content:encoded'] || ''; // Medium uses 'content:encoded' in some feeds
        if (content.indexOf(duplicateTitleInContent) === 0) {
            content = content.split(duplicateTitleInContent)[1];
        }
        const date = new Date(x.isoDate);
        const milliseconds = date.getTime();
        return {
            id: x.id || x.guid,
            title: x.title,
            author: x.creator || x.author,
            createdAt: milliseconds,
            description: content.substring(0, 320),
            url: x.link,
            imageUrl: content.match(regEx) ? content.match(regEx)[1] : null
        };
    });

    await upsertMediumPosts(blogItems);

    res.status(200).json({
        blogPosts: blogItems
    });
  } catch (error) {
    const posts = await getMediumPosts();
    if(Array.isArray(posts)){
      res.status(200).json({blogPosts: posts});
    } else {
      logError(error);
      res.json({ success: false, error: error.message || error });
    }
  }
});

module.exports = router;