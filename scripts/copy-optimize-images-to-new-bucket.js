const uploadToAWS = require("../api/helpers/upload-to-aws.js");
const AWS = require("aws-sdk");
const jimp = require('jimp');
const async = require('async');
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

let downloadedFileCount = 0, lastDownloadedFile, isMore = true;
let countTest = 0;
let oldBucket = "uploads.participedia.xyz";

async.whilst(
  () => {return isMore;},
  cb => {
    s3.listObjectsV2({
      Bucket: oldBucket,
      StartAfter: lastDownloadedFile,
      MaxKeys: 20
    }, (err, assetsList) => {
      async.eachSeries(assetsList.Contents, (asset, innerCb) => {
        downloadedFileCount++;
        lastDownloadedFile = asset.Key;
        console.log(lastDownloadedFile);
        console.log(downloadedFileCount);
        s3.getObject({
          Bucket: oldBucket,
          Key: lastDownloadedFile
        }, (err, object) => {
          console.log(object.ContentType);

          async.parallel([
            uploadCb => { // Thumbnail upload
              if (object.ContentType.includes("image")) {
                // Resize images
                jimp.read(object.Body, (err, img) => {
                  if (err) {
                    uploadCb(err);
                  } else {
                    if (img.bitmap.width > 600 || img.bitmap.height > 600) { // Resize required
                      let resizeW = 600;
                      let resizeH = jimp.AUTO;
                      if (img.bitmap.width < img.bitmap.height) {
                        resizeW = jimp.AUTO;
                        resizeH = 600;
                      }
                      img
                        .resize(resizeW, resizeH) // resize
                        .quality(60) // set image quality
                        .getBase64(object.ContentType, (err, imgData) => {
                          if (err){
                            uploadCb(err);
                          } else {
                            s3.upload({
                              Bucket: process.env.AWS_S3_BUCKET,
                              Key: `thumbnail/${asset.Key}`,
                              Body: Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ""), "base64"),
                              ContentEncoding: "base64",
                              ContentType: object.ContentType,
                              ACL: "public-read",
                            }, (err, data) => {
                              if (err) {
                                uploadCb(err);
                              } else {
                                uploadCb();
                              }
                            });
                          }
                        });
                    } else { // the image is too small to be resized, just upload to the new bucket
                      img.getBase64(object.ContentType, (err, imgData) => {
                        if(err){
                          s3.copyObject({
                            Bucket: process.env.AWS_S3_BUCKET,
                            CopySource: encodeURI(`${oldBucket}/${asset.Key}`),
                            ContentType: object.ContentType,
                            ACL: "public-read",
                            MetadataDirective: "COPY",
                            Key: asset.Key
                          }, uploadCb);
                        } else {
                          s3.upload({
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `thumbnail/${asset.Key}`,
                            Body: Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ""), "base64"),
                            ContentEncoding: "base64",
                            ContentType: object.ContentType,
                            ACL: "public-read",
                          }, (err, data) => {
                            if (err) {
                              uploadCb(err);
                            } else {
                              uploadCb();
                            }
                          });
                        }
                      });
                    }
                  }
                });
              } else { // No need to upload thumbnail for anything else but images
                uploadCb();
              }
            },
            uploadCb => { // Full size image and other file types upload
              if (object.ContentType.includes("image")) { // Optimize full size image
                jimp.read(object.Body, (err, img) => {
                  if (err) {
                    uploadCb(err);
                  } else {
                    if (img.bitmap.width > 1600 || img.bitmap.height > 1600) { // Resize required
                      let resizeW = 1600;
                      let resizeH = jimp.AUTO;
                      if (img.bitmap.width < img.bitmap.height) {
                        resizeW = jimp.AUTO;
                        resizeH = 1600;
                      }
                      img
                        .resize(resizeW, resizeH) // resize
                        .quality(60) // set image quality
                        .getBase64(object.ContentType, (err, imgData) => {
                          if (err) {
                            uploadCb(err);
                          } else {
                            s3.upload({
                              Bucket: process.env.AWS_S3_BUCKET,
                              Key: asset.Key,
                              Body: Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ""), "base64"),
                              ContentEncoding: "base64",
                              ContentType: object.ContentType,
                              ACL: "public-read"
                            }, uploadCb);
                          }
                        });
                    } else { // the image is too small to be resized, just upload to the new bucket
                      img.getBase64(object.ContentType, (err, imgData) => {
                        if(err){
                          s3.copyObject({
                            Bucket: process.env.AWS_S3_BUCKET,
                            CopySource: encodeURI(`${oldBucket}/${asset.Key}`),
                            ContentType: object.ContentType,
                            ACL: "public-read",
                            MetadataDirective: "COPY",
                            Key: asset.Key
                          }, uploadCb);
                        } else {
                          s3.upload({
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: asset.Key,
                            Body: Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ""), "base64"),
                            ContentEncoding: "base64",
                            ContentType: object.ContentType,
                            ACL: "public-read"
                          }, uploadCb);
                        }
                      });
                    }
                  }
                });
              } else { // Copy over documents
                s3.copyObject({
                  Bucket: process.env.AWS_S3_BUCKET,
                  CopySource: encodeURI(`${oldBucket}/${asset.Key}`),
                  ContentType: object.ContentType,
                  ACL: "public-read",
                  MetadataDirective: "COPY",
                  Key: asset.Key
                }, uploadCb);
              }
            }
          ], innerCb);
        });
      }, err => {
        if(err) {
          cb(err);
        } else {
          // if(!assetsList.IsTruncated) {
          //   isMore = false
          // }
          countTest++;
          if (countTest == 2) {
            isMore = false
          }
          cb();
        }
      });
    });
  },
  (err) => {
    if(err) throw err;
  }
);




