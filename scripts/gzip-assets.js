// const {gzip, ungzip} = require('node-gzip');
// const request = require('request').defaults({ encoding: null });
// const AWS = require("aws-sdk");
// const async = require("async");
// const s3 = new AWS.S3({
//   apiVersion: "2006-03-01",
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// let downloadedFileCount = 0,
//   lastDownloadedFile = '',
//   isMore = true;

// async.whilst(
//   () => {
//     return isMore;
//   },
//   cb => {
//     s3.listObjectsV2(
//       {
//         Bucket: process.env.AWS_S3_BUCKET,
//         StartAfter: lastDownloadedFile
//       },
//       (err, assetsList) => {
//         async.eachSeries(
//           assetsList.Contents,
//           (asset, innerCb) => {
//             downloadedFileCount++;
//             lastDownloadedFile = asset.Key;
//             let downloadUrl = `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET}/${asset.Key}`;
//             console.log(lastDownloadedFile);
//             console.log(downloadUrl);
//             console.log(downloadedFileCount);


//             s3.getObject({
//               Bucket: process.env.AWS_S3_BUCKET,
//               Key: lastDownloadedFile,
//             },
//             (err, object) => {
//               console.log(object.ContentType);
//               request.get(downloadUrl, function (err, res, body) {
//                 gzip(body)
//                   .then(gzBuffer => {
//                     const uploadParams = {
//                       Bucket: process.env.AWS_S3_BUCKET,
//                       Key: asset.Key,
//                       Body: gzBuffer,
//                       ContentEncoding: "gzip",
//                       ContentType: object.ContentType,
//                       ACL: "public-read"
//                     };

//                     s3.upload(uploadParams, innerCb);
//                   })
//                   .catch(err => {
//                     console.error(err);
//                     innerCb();
//                   })
//               });
//             });
//           },
//           err => {
//             if (err) {
//               cb(err);
//             } else {
//               if (!assetsList.IsTruncated) {
//                 isMore = false;
//               }
//               cb();
//             }
//           }
//         );
//       }
//     );
//   },
//   err => {
//     if (err) throw err;
//   }
// );



