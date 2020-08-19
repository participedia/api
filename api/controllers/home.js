"use strict";
let express = require("express");
let router = express.Router();
const logError = require("../helpers/log-error.js");

router.get("/", async function(req, res) {
  let returnType = req.query.returns;
  switch (returnType) {
    case "json":
      return res.status(200).json({
        user: req.user || null,
      });
    case "html": // fall through
    default:
      return res.status(200).render("home", {
        user: req.user || null,
      });
  }
});

module.exports = router;
