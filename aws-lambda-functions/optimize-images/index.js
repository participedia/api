const AWS = require("aws-sdk");
const jimp = require("jimp");
const { gzip, ungzip } = require("node-gzip");
const s3 = new AWS.S3();

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

function uploadObject(buffer, bucket, contentType, filename, cb) {
  console.log(`UPLOAD ${filename}`);
  gzip(buffer)
    .then(gzBuffer => {
      const uploadParams = {
        Bucket: bucket,
        Key: filename,
        Body: gzBuffer,
        ContentEncoding: "gzip",
        ContentType: contentType,
        ACL: "public-read",
      };

      s3.upload(uploadParams, cb);
    })
    .catch(cb);
}

exports.handler = function(event, context, callback) {
  var key = event.Records[0].s3.object.key;
  var bucket = event.Records[0].s3.bucket.name;
  var rawUrl = `https://s3.amazonaws.com/${bucket}/${key}`;
  console.log(key);
  console.log(bucket);
  s3.headObject(
    {
      Bucket: bucket,
      Key: key,
    },
    function(err, data) {
      if (err) {
        // an error occurred
        console.error(err, err.stack);
        callback(err);
      } else {
        let contentType = data.ContentType;
        console.log(contentType);

        if ([ALLOWED_IMAGE_TYPES].includes(contentType)) {
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
          // s3.copyObject( // Put object in root folder and thumbnail
          //   {
          //     Bucket: bucket,
          //     CopySource: key,
          //     ContentType: object.ContentType,
          //     ACL: "public-read",
          //     MetadataDirective: "COPY",
          //     Key: key.split('/')[1],
          //   }, (err) => {
          //     if(err){
          //       console.error(err);
          //     } else {
          //       callback(null, {
          //         statusCode: 200,
          //         body: event.Records[0].s3.object.key
          //       });
          //     }
          //   }
          // );
          callback(null, {
            statusCode: 200,
            body: event.Records[0].s3.object.key,
          });
        }
      }
    }
  );
};
