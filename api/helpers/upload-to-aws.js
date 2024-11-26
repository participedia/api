const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const logError = require("./log-error.js");
const fs = require('fs');
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const { ALLOWED_IMAGE_TYPES } = require("../../constants.js");

AWS.config.update({ region: process.env.AWS_REGION });

function createBufferFromBase64(base64String) {
  return Buffer.from(
    base64String.split(";")[1].split(",")[1],
    "base64"
  );
}

function uploadObject(buffer, contentType, filename, cb) {
  let key = `raw/${filename}`;
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentEncoding: "base64",
    ContentType: contentType,
    ACL: "public-read"
  };

  s3.upload(uploadParams, cb);
}

const uploadToAWS = (base64String) => {
  const contentType = base64String.split(":")[1].split(";")[0];
  const contentExtension = base64String.substring("data:image/".length, base64String.indexOf(";base64"));
  const newFileName = uuidv4() + "." + contentExtension;
  const base64Buffer = createBufferFromBase64(base64String);
  const key = `raw/${newFileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key, 
    Body: base64Buffer,
    ContentEncoding: "base64",
    ContentType: contentType,
    ACL: "public-read"
  };

  try {
    const stored = s3.upload(params).promise();
    uploadedLocation = stored.Location;
  } catch (err) {
    console.log(err)
  }

  return `${process.env.AWS_UPLOADS_URL}${newFileName}`;
}

const uploadCSVToAWS = async (files, filename) => {
  const fileContent = fs.readFileSync(files);
  let uploadedLocation = "";

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename, 
    Body: fileContent,
    ACL: "public-read"
  };

  try {
    const stored = await s3.upload(params).promise();
    uploadedLocation = stored.Location;
  } catch (err) {
    console.log(err)
  }

  return uploadedLocation;
}

module.exports = {uploadToAWS, uploadCSVToAWS};
