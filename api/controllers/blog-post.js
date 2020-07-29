"use strict";
const express = require("express");
const router = express.Router();
const https = require('https');

router.get("/", async (req, res) => {
	const accessToken = '2efa4f5dcb2b46e326a8757041bb6d7737227e1047136a25a2f075b1376c5e8eb';
	const options = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		hostname: 'api.medium.com',
		path: '/v1/users/18f729917fbdb970c2554947447fe880744d837d8e885efa9a26a1e9c1fb5f614/publications',
	};

  https.get(options, r => {
    r.setEncoding('utf8');
    let body = '';
    r.on('data', data => {
      body += data;
    });
    r.on('end', () => {
      try {
      	res.status(200).json(JSON.parse(body));
      } catch(e) {
      	console.error(e);
      	res.status(200).json(JSON.parse(e));
      }
    });
    r.on('error', error => {
    	console.error(error);
      res.status(200).json(error);
    });
  });
});

module.exports = router;