"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let groups = require("../helpers/groups");

router.get("/search", function(req, res) {
  groups.user_has(
    req,
    "Contributors",
    function() {
      console.log("user doesn't have Contributors group membership");
      res.status(401).json({
        message: "access denied - user does not have proper authorization"
      });
      return;
    },
    function() {
      app.use(
        "/s3",
        require("react-dropzone-s3-uploader/s3router")({
          bucket: "uploads.participedia.xyz",
          region: "us-east-1", // optional
          headers: { "Access-Control-Allow-Origin": "*" }, // optional
          ACL: "private" // this is default
        })
      );
    }
  );
});
