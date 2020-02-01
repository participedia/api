const AWS = require("aws-sdk");
const jimp = require('jimp');
const uuidv4 = require("uuid/v4");
const logError = require("./log-error.js");
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

AWS.config.update({ region: process.env.AWS_REGION });

function createBufferFromBase64 (base64String) {
  return Buffer.from(
    base64String.split(";")[1].split(",")[1],
    "base64"
  );
}

function optimizeImage(buffer, contentType, size, cb) {
  jimp.read(buffer, (err, img) => {
    if (err) {
      cb(err);
    } else {
      if (img.bitmap.width > size || img.bitmap.height > size) { // Resize required
        let resizeW = size;
        let resizeH = jimp.AUTO;
        if (img.bitmap.width < img.bitmap.height) {
          resizeW = jimp.AUTO;
          resizeH = size;
        }
        img
          .resize(resizeW, resizeH) // resize
          .quality(60) // set image quality
          .getBuffer(contentType, cb);
      } else { // the image is too small to be resized, just return the same buffer
        cb(null, buffer);
      }
    }
  });
}

function uploadObject(buffer, contentType, filename, isThumbnail, cb) {
  let key = filename;
  if(isThumbnail) {
    key = `thumbnail/${filename}`;
  }
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentEncoding: "base64",
    ContentType: contentType,
    ACL: "public-read",
  };

  s3.upload(uploadParams, cb);
}

function uploadToAWS(base64String) {
  const newFileName = uuidv4();
  const base64Buffer = createBufferFromBase64(base64String);

  const contentType = base64String.split(":")[1].split(";")[0];

  if (contentType === "image/png" || contentType === "image/jpg" || contentType === "image/jpeg") { // is image
    optimizeImage(base64Buffer, contentType, 600, (err, buffer) => { // Optimize and upload thumbnail
      uploadObject(buffer, contentType, newFileName, true, (err, data) => {
        if (err) {
          logError(err);
        }
      });
    });
    optimizeImage(base64Buffer, contentType, 1600, (err, buffer) => { // Optimize and upload full image
      uploadObject(buffer, contentType, newFileName, false, (err, data) => {
        if (err) {
          logError(err);
        }
      });
    });
  } else {
    uploadObject(base64Buffer, contentType, newFileName, false, (err, data) => {
      if (err) {
        logError(err);
      }
    });
  }

  return `${process.env.AWS_UPLOADS_URL}${newFileName}`;
}

module.exports = uploadToAWS;
