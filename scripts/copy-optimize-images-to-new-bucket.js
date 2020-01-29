const uploadToAWS = require("../api/helpers/upload-to-aws.js");
const AWS = require("aws-sdk");
const jimp = require('jimp');
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_REGION,
  accessKeyId: "AKIAJZHWJQ2EEYB5TRWA",
  secretAccessKey: "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"
});

let downloadedFileCount = 0, lastDownloadedFile;

function downloadAssets(){
  s3.listObjectsV2({
    Bucket: "uploads.participedia.xyz",
    StartAfter: lastDownloadedFile
  }, (err, assetsList) => {
    assetsList.Contents.forEach(asset => {
      downloadedFileCount++;
      lastDownloadedFile = asset.Key;
      console.log(lastDownloadedFile);
      console.log(downloadedFileCount);
    });
    if(assetsList.IsTruncated) {
      downloadAssets();
    };
  });
};

jimp.read('https://s3.amazonaws.com/participedia.stage/0bdb532c-04a6-44da-939b-3b91479894c4', (err, img) => {
  if (err) throw err;
  let resizeW = 600;
  let resizeH = jimp.AUTO;
  if(img.bitmap.width < img.bitmap.height) {
    resizeW = jimp.AUTO;
    resizeH = 600;
  }
  img
    .scaleToFit(resizeW, resizeH) // resize
    .quality(60) // set JPEG quality
    .getBase64(jimp.MIME_JPEG, (err, imgData) => {
      if (err) throw err;
      console.log(imgData);
    }); // save
});

downloadAssets();



