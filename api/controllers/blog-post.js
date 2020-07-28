"use strict";
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.status(200).json({ OK: true, msg: 'Hello World!' });
});

module.exports = router;