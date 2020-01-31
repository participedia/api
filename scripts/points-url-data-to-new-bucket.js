const promise = require("bluebird");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const pgp = require("pg-promise")(options);
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
const oldS3Url = 'uploads.participedia.xyz';
const newS3Url = process.env.AWS_S3_BUCKET;

let config;
try {
  config = parse(connectionString);
  if (process.env.NODE_ENV === "test" || config.host === "localhost") {
    config.ssl = false;
  } else {
    config.ssl = true;
  }
} catch (e) {
  console.error("# Error parsing DATABASE_URL environment variable");
}

let db = pgp(config);
getPhotos('cases');
getPhotos('methods');
getPhotos('organizations');

function getPhotos(table) {
  db.any(`SELECT id, photos FROM ${table}`)
  .then(function(data) {
    data.forEach(data => {
      var photo = data.photos;
      if (photo.search(oldS3Url) >= 0) {
        var newPhoto = photo.replace(oldS3Url, newS3Url);
        updatePhoto(data.id, newPhoto, table);
      } else {
        console.log(`Row ${data.id} doesn't have the URL we are looking for.`);
      }
    });
  })
  .catch(function(error) {
    console.log(error);
  });
}

function updatePhoto(id, value, table) {
  const dataSingle = {photos: value};
  const condition = pgp.as.format(` WHERE id = ${id}`, dataSingle);
  const update = pgp.helpers.update(dataSingle, null, table) + condition;
  
  db.none(update)
  .then(function(data) {
    console.log(`Table: ${table}; ID: ${id} updated`);
  })
  .catch(function(error) {
    console.log(error);
  });
}