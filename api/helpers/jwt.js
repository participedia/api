const ejwt = require("express-jwt");
const log = require("winston");

if (!process.env.AUTH0_CLIENT_SECRET) {
  log.error("need to set AUTH0_CLIENT_SECRET");
  process.exit(0);
}
if (!process.env.AUTH0_CLIENT_ID) {
  log.error("need to set AUTH0_CLIENT_ID");
  process.exit(0);
}

// Initialize express-jwt
const jwt = function() {
  return ejwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, "base64"),
    audience: process.env.AUTH0_CLIENT_ID
  });
};

module.exports = jwt;
