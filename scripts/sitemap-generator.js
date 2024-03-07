require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const { db, pgp } = require("../api/helpers/db.js");
const fs = require('fs');

// Define your website URL
const websiteUrl = 'https://participedia.net';

// Define the routes of your website
const routes = [
  '/',
  '/about',
  '/teaching',
  '/participediaschool',
  '/research',
  '/getting-started',
  '/help-faq-contact',
  '/legal'
];

async function generateSitemap() {
  console.log('*********** START PROCESSING ***********');

  try {
    const entries = await db.any(
      `
      SELECT id, type, hidden, published FROM things WHERE hidden = false AND published = true
      `
    );

    // Generate the sitemap content
    let sitemapContent = '';

    routes.forEach(route => {
      sitemapContent += websiteUrl + route + '\n';
    })
    entries.forEach(entry => {
      const type = entry.type;
      const id = entry.id;
      const url = `${websiteUrl}/${type}/${id}`;
      console.log('@@@@@@@@@@@@@@@2 url ', url);
      sitemapContent += url + '\n';
    })
  
    // Write the sitemap content to a file
    fs.writeFileSync('./public/sitemap.txt', sitemapContent);
    console.log('Sitemap.txt generated successfully!');

    process.exit();
  } catch (error) {
    console.log('????????????????? catch error ?????????????? error', error)
    process.exit();
  }

}

generateSitemap();