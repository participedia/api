const AWS = require("aws-sdk");
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
  uploadObject(base64Buffer, contentType, newFileName, false, (err, data) => {
    if (err) {
      logError(err);
    }
  });

  return `${process.env.AWS_UPLOADS_URL}${newFileName}`;
}

module.exports = uploadToAWS;
