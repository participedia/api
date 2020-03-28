const promise = require("bluebird");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const pgp = require("pg-promise")(options);
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
// const oldS3Url = "uploads.participedia.xyz";
const oldS3Url = new RegExp('uploads.participedia.xyz', 'g');
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
getPhotos("cases");
getPhotos("methods");
getPhotos("organizations");

function getPhotos(table) {
  db.any(`SELECT id, photos, files, videos, audio FROM ${table}`)
    .then(function(data) {
      data.forEach(data => {
        // Handle photos
        var newPhoto = data.photos;
        var newFiles = data.files;
        var newVideos = data.videos;
        var newAudio = data.audio;
        var metaData = {};

        if (newPhoto.search(oldS3Url) >= 0) {
          newPhoto = newPhoto.replace(oldS3Url, newS3Url);
          metaData["photos"] = newPhoto;
          // console.log(`Table: ${table}, Column 'photos', ID ${data.id} has the URL we are looking for.`);
          // console.log(metaData["photos"]);
        } else {
          // console.log(`Table: ${table}, Column 'photos', ID ${data.id} doesn't have the URL we are looking for.`);
        }

        if (newFiles.search(oldS3Url) >= 0) {
          newFiles = newFiles.replace(oldS3Url, newS3Url);
          metaData["files"] = newFiles;
          // console.log(`Table: ${table}, Column 'files', ID ${data.id} has the URL we are looking for.`);
          // console.log(metaData["files"]);
        } else {
          // console.log(`Table: ${table}, Column 'files', ID ${data.id} doesn't have the URL we are looking for.`);
        }

        if (newVideos.search(oldS3Url) >= 0) {
          newVideos = newVideos.replace(oldS3Url, newS3Url);
          metaData["videos"] = newAudio;
          // console.log(`Table: ${table}, Column 'videos', ID ${data.id} has the URL we are looking for.`);
          // console.log(metaData["videos"]);
        } else {
          // console.log(`Table: ${table}, Column 'videos', ID ${data.id} doesn't have the URL we are looking for.`);
        }

        if (newAudio.search(oldS3Url) >= 0) {
          newAudio = newAudio.replace(oldS3Url, newS3Url);
          metaData["audio"] = newAudio;
          // console.log(`Table: ${table}, Column 'audio', ID ${data.id} has the URL we are looking for.`);
          // console.log(metaData["audio"]);
        } else {
          // console.log(`Table: ${table}, Column 'audio', ID ${data.id} doesn't have the URL we are looking for.`);
        }

        if (
          metaData.hasOwnProperty("photos") ||
          metaData.hasOwnProperty("files") ||
          metaData.hasOwnProperty("videos") ||
          metaData.hasOwnProperty("audio")
        ) {
          updatePhoto(data.id, metaData, table);
        }
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function updatePhoto(id, value, table) {
  const dataSingle = value;
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
