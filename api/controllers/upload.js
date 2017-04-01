"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap

router.get("/search", function(req, res) {
  app.use(
    "/s3",
    require("react-dropzone-s3-uploader/s3router")({
      bucket: "uploads.participedia.xyz",
      region: "us-east-1", // optional
      headers: { "Access-Control-Allow-Origin": "*" }, // optional
      ACL: "private" // this is default
    })
  );
});
