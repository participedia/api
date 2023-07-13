"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap

let { db } = require("../helpers/db");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

router.get("/export/csv", requireAuthenticatedUser(), async function(req, res) {
    const user_query = req.query.query || "";
    
    const returnType = req.query.returns || "html";
    if (returnType === "html") {
    return res.status(200).render(`csv-exports`, { results });
    } else if (returnType === "json") {
    return res.status(200).json(data);
    }
  });

module.exports = router;