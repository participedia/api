// - for all cases and organizations
// - compose an address string from the following article
//   location keys: address1, city, province, postal_code, country.
// - if no address string exists (meaning location keys are all falsey),
//   save lat/lng as null
// - if address string exists, pass that address string to geocode
//   service to get lat/lng and save new lat/lng.

// to run: node scripts/geocode-address-for-lat-lng.js

const GoogleMaps = require("@google/maps");
const { db } = require("../api/helpers/db.js");

const googleMapsClient = GoogleMaps.createClient({
  key: process.env.GOOGLE_MAPS_GEOCODE_API_KEY,
  Promise: Promise,
});

const MAP_TYPE_TO_DB_TABLE = {
  case: "cases",
  organization: "organizations",
};

function composeAddressString(article) {
  const { address1, city, province, postal_code, country } = article;
  const addressData = [address1, city, province, postal_code, country];
  let addressString = "";
  addressData.forEach((item, i) => {
    // if item is not empty string, add to address string
    if (item !== "") {
      addressString = addressString + item;
      if (i !== addressData.length - 1) {
        // if it's not the last item, append a comma and space
        addressString = addressString + ", ";
      }
    }
  });
  return addressString;
}

async function getAllArticlesForType(type) {
  // select articles that are not hidden and do not have latitude and longitude set
  const sql = `
    SELECT type, latitude, longitude, id, address1, city, province, postal_code, country
    FROM ${MAP_TYPE_TO_DB_TABLE[type]}
    WHERE hidden IS NOT TRUE
    AND latitude IS NULL
    AND longitude IS NULL;
  `;
  return db.any(sql).then(result => result).catch((err) => console.log("getAllArticlesForType err", err));
}

function saveArticle(type, id, lat, lng) {
  const sql = `
    UPDATE ${MAP_TYPE_TO_DB_TABLE[type]}
    SET latitude = ${lat}, longitude = ${lng}
    WHERE id = ${id};
  `;
  return db.any(sql).then(result => result).catch((err) => console.log("saveArticle err", err));;
}

async function processArticles(type) {
  const articles = await getAllArticlesForType(type);
  articles.forEach(function(article) {
    const addressString = composeAddressString(article);
    if (addressString !== "") {
      // Geocode an address string to get lat/long
      googleMapsClient
        .geocode({ address: addressString })
        .asPromise()
        .then((response) => {
          // set new lat lng on article object and save
          if (response.json.results && response.json.results[0]) {
            const { lat, lng } = response.json.results[0].geometry.location;
            if (lat && lng) {
              saveArticle(article.type, article.id, lat, lng).then(() => {
                console.log(`UPDATED - ${article.type} #${article.id} saved with lat: ${lat}, lng: ${lng}`);
              });
            }
          }
        })
        .catch((err) => {
          if (err) console.log("error:", err);
        });
    } else {
      // if there is no address data, set lat/lng to NULL
      saveArticle(article.type, article.id, null, null).then(() => {
        console.log(`NULL - ${article.type} #${article.id} - There is no address data, setting lat/lng as null`);
      });
    }
  });
}

function start() {
  if (!process.env.GOOGLE_MAPS_GEOCODE_API_KEY) {
    console.log("*** Missing Google Maps Geocode API key. Add GOOGLE_MAPS_GEOCODE_API_KEY to your .env file ***")
    console.log("https://developers.google.com/maps/documentation/geocoding/get-api-key")
    return;
  }

  const types = Object.keys(MAP_TYPE_TO_DB_TABLE);
  types.forEach(type => processArticles(type));
}

start();
