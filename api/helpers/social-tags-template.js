function socialTagsTemplate(title, description, url, imageUrl) {
  let meta = '';
  if(url && typeof url === 'string' && url.includes('/user/')){
    meta += `<meta name="robots" content="noindex">`
  }
  return meta += `
    <meta itemprop="name" content="${title}">
    <meta itemprop="description" content="${description}">
    <meta itemprop="image" content="${imageUrl}">

    <meta property="og:url" content="${url}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:title" content="${title}"/>
    <meta property="og:description" content="${description}"/>
    <meta property="og:image" content="${imageUrl}"/>

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
  `;
}

module.exports = socialTagsTemplate;
