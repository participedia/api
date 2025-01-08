// const AWS = require("aws-sdk");
// const jimp = require("jimp");
// const async = require("async");
// const s3 = new AWS.S3({
//   apiVersion: "2006-03-01",
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// let downloadedFileCount = 0,
//   lastDownloadedFile,
//   isMore = true;
// let oldBucket = "uploads.participedia.xyz";

// async.whilst(
//   () => {
//     return isMore;
//   },
//   cb => {
//     s3.listObjectsV2(
//       {
//         Bucket: oldBucket,
//         Delimiter: "/",
//         StartAfter: lastDownloadedFile
//       },
//       (err, assetsList) => {
//         async.eachSeries(
//           assetsList.Contents,
//           (asset, innerCb) => {
//             downloadedFileCount++;
//             lastDownloadedFile = asset.Key;
//             console.log(lastDownloadedFile);
//             console.log(encodeURI(`${oldBucket}/${asset.Key}`));
//             console.log(downloadedFileCount);
//             s3.getObject(
//               {
//                 Bucket: oldBucket,
//                 Key: lastDownloadedFile,
//               },
//               (err, object) => {
//                 console.log(object.ContentType);

//                 // Copy over documents
//                 s3.copyObject(
//                   {
//                     Bucket: process.env.AWS_S3_BUCKET,
//                     CopySource: encodeURI(`${oldBucket}/${asset.Key}`),
//                     ContentType: object.ContentType,
//                     ACL: "public-read",
//                     MetadataDirective: "COPY",
//                     Key: `raw/${asset.Key}`,
//                   }, (err) => {
//                     if(err){
//                       console.error(err);
//                     }
//                     innerCb();
//                   }
//                 );
//               }
//             );
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
