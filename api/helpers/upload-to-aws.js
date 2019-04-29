const AWS = require("aws-sdk");
const uuidv4 = require("uuid/v4");

AWS.config.update({ region: process.env.AWS_REGION });

function uploadToAWS(base64String, fileName) {
  const newFileName = uuidv4() + "-" + fileName;
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  const base64Data = Buffer.from(
    base64String.split(";")[1].split(",")[1],
    "base64"
  );

  const contentType = base64String.split(":")[1].split(";")[0];

  const uploadParams = {
    Bucket: "uploads.participedia.xyz",
    Key: newFileName,
    Body: base64Data,
    ContentEncoding: "base64",
    ContentType: contentType,
    ACL: "public-read"
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) console.log("Error", err);
    // if (data) console.log("success");
  });

  return `${process.env.AWS_UPLOADS_URL}${newFileName}`;
}

module.exports = uploadToAWS;
