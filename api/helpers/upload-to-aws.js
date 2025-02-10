const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { v4: uuidv4 } = require("uuid");
const logError = require("./log-error.js");
const fs = require('fs');
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// const s3 = new AWS.S3({
//   apiVersion: "2006-03-01",
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

const { ALLOWED_IMAGE_TYPES } = require("../../constants.js");

// AWS.config.update({ region: process.env.AWS_REGION });

function createBufferFromBase64(base64String) {
  return Buffer.from(
    base64String.split(";")[1].split(",")[1],
    "base64"
  );
}

// function uploadObject(buffer, contentType, filename, cb) {
//   let key = `raw/${filename}`;
//   const uploadParams = {
//     Bucket: process.env.AWS_S3_BUCKET,
//     Key: key,
//     Body: buffer,
//     ContentEncoding: "base64",
//     ContentType: contentType,
//     ACL: "public-read"
//   };

//   s3.upload(uploadParams, cb);
// }

const uploadToAWS = (base64String) => {
  const contentType = base64String.split(":")[1].split(";")[0];
  const contentExtension = base64String.substring("data:image/".length, base64String.indexOf(";base64"));
  const newFileName = uuidv4() + "." + contentExtension;
  const base64Buffer = createBufferFromBase64(base64String);
  const key = `raw/${newFileName}`;

  // Prepare upload parameters
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: base64Buffer,
    ContentEncoding: "base64",
    ContentType: contentType,
    ACL: "public-read",
  };


  try {
    // Use the Upload helper to handle the put operation
    const parallelUpload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    // This promise resolves when upload is complete
    parallelUpload.done();
    
    return `${process.env.AWS_UPLOADS_URL}${newFileName}`;
  } catch (err) {
    console.log("uploadToAWS ", err)
    throw err;
  }

}

const uploadCSVToAWS = async (files, filename) => {
  // Read file content from disk
  const fileContent = fs.readFileSync(files);
  
  // Construct the S3 upload parameters
  let uploadedLocation = "";
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
    Body: fileContent,
    ACL: "public-read",
  };

  try {
    // Use the high-level Upload class (@aws-sdk/lib-storage)
    const parallelUpload = new Upload({
      client: s3Client,
      params,
    });
   // Wait for the upload to complete
    const uploadResult = await parallelUpload.done();
    // The result has the Location, ETag, etc.
    uploadedLocation = uploadResult.Location;
    
  } catch (err) {
    console.log(err)
  }

  return uploadedLocation;
}

module.exports = {uploadToAWS, uploadCSVToAWS};
