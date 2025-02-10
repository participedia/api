// zip -r ../optimize-images.zip *
const { S3Client, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const jimp = require("jimp");
const { gzip } = require("node-gzip");
const request = require('request').defaults({ encoding: null });
const s3 = new S3Client({ region: process.env.REGION });


const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

function optimizeImage(filename, contentType, size, cb) {
  console.log(filename);
  jimp.read(filename, (err, img) => {
    console.log("LOADED IMAGE");
    if (err) {
      console.error(err);
      cb(err);
    } else {
      if (img.bitmap.width > size || img.bitmap.height > size) {
        // Resize required
        console.log("PERFORM OPTIMIZATION");
        let resizeW = size;
        let resizeH = jimp.AUTO;
        if (img.bitmap.width < img.bitmap.height) {
          resizeW = jimp.AUTO;
          resizeH = size;
        }
        img
          .resize(resizeW, resizeH) // resize
          .quality(75) // set image quality
          .getBuffer(contentType, cb);
      } else {
        // the image is too small to be resized, just return the same buffer
        console.log("SKIP OPTIMIZATION");
        img.getBuffer(contentType, cb);
      }
    }
  });
}

/**
 * Gzip-compress and upload an object to S3 using PutObjectCommand
 * @param {Buffer} buffer - The content to upload.
 * @param {string} bucket - S3 bucket name.
 * @param {string} contentType - MIME type.
 * @param {string} filename - S3 key (file path).
 * @param {Function} cb - Callback function (err, data).
 */
function uploadObject(buffer, bucket, contentType, filename, cb) {
  console.log(`UPLOAD ${filename}`);
  gzip(buffer).then((gzBuffer) => {
    const uploadParams = {
      Bucket: bucket,
      Key: filename,
      Body: gzBuffer,
      ContentEncoding: "gzip",
      ContentType: contentType,
      ACL: "public-read",
    };

    // Send PutObjectCommand
    s3.send(new PutObjectCommand(uploadParams))
      .then((data) => {
        cb(null, data);
      })
      .catch((err) => {
        cb(err);
      });
  })
  .catch(cb);
}

exports.handler = function(event, context, callback) {
  var key = event.Records[0].s3.object.key;
  var bucket = event.Records[0].s3.bucket.name;
  var rawUrl = `https://s3.amazonaws.com/${bucket}/${key}`;
  console.log(key);
  console.log(bucket);
  s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  .then((data) =>{
    let contentType = data.ContentType;
    console.log(contentType);

    if (ALLOWED_IMAGE_TYPES.includes(contentType)) {
      // is image
      // large image resize
      optimizeImage(rawUrl, contentType, 1600, (err, lBuffer) => {
        // Optimize and upload thumbnail
        if (err) {
          console.error(err);
          callback(err);
        } else {
          console.log("UPLOADED LARGE IMAGE");
          uploadObject(
            lBuffer,
            bucket,
            contentType,
            key.split("/")[1],
            (err, data) => {
              if (err) {
                console.error(err);
                callback(err);
              } else {
                console.log("COMPLETE OPTIMIZATION OF THUMBNAIL");
                //thumbnail resize
                optimizeImage(rawUrl, contentType, 600, (err, tBuffer) => {
                  // Optimize and upload thumbnail
                  if (err) {
                    console.error(err);
                    callback(err);
                  } else {
                    console.log("COMPLETE OPTIMIZATION OF LARGE IMAGE");
                    uploadObject(
                      tBuffer,
                      bucket,
                      contentType,
                      `thumbnail/${key.split("/")[1]}`,
                      (err, data) => {
                        if (err) {
                          console.error(err);
                          callback(err);
                        } else {
                          console.log("UPLOADED THUMBNAIL");
                          callback(null, {
                            statusCode: 200,
                            body: event.Records[0].s3.object.key,
                          });
                        }
                      }
                    );
                  }
                });
              }
            }
          );
        }
      });
    } else {
      console.log("NOT AN IMAGE");
      request.get(rawUrl, function (err, res, body) {
        uploadObject(body, bucket, contentType, key.split("/")[1], err => {
          if(err){
            console.error(err);
          } else {
            console.log("UPLOADED TO ROOT");
            uploadObject(body, bucket, contentType, `thumbnail/${key.split("/")[1]}`, err => {
              if(err){
                console.error(err);
              } else {
                console.log("UPLOADED TO THUMBNAIL");
                callback(null, {
                  statusCode: 200,
                  body: event.Records[0].s3.object.key
                });
              }
            });
          }
        });
      });
    }
  }).catch(error => {
    console.error(error);
    callback(err);
  });
};