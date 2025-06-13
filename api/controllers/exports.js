"use strict";
let express = require("express");
let router = express.Router();

const {
  getCSVEntry,
  removeCSVEntry
} = require("../helpers/export-helpers");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

router.get("/csv", requireAuthenticatedUser(), async function(req, res) {
  let results = await getCSVEntry(req.user.id.toString());

  results = results.map(entry => ({
    ...entry,
    requested_timestamp_iso: entry.requested_timestamp
      ? new Date(entry.requested_timestamp).toISOString()
      : "",
    finished_timestamp_iso: entry.finished_timestamp
      ? new Date(entry.finished_timestamp).toISOString()
      : ""
  }));

  return res.status(200).render(`csv-exports`, {
    results
  });

});

router.delete("/csv", requireAuthenticatedUser(), async function(req, res) {
  let results = await removeCSVEntry(req.body.entryId, req.user.id);
  res.status(200).json({
    OK: true,
  });
});

module.exports = router;