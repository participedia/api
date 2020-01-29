const uploadToAWS = require("../api/helpers/upload-to-aws.js");
const AWS = require("aws-sdk");
const jimp = require('jimp');
const s3 = new AWS.S3();

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
    .write('test.jpg'); // save
});



