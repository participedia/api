var ejwt = require('express-jwt');

if (! process.env.AUTH0_CLIENT_SECRET) {
  console.log("need to set AUTH0_CLIENT_SECRET")
  process.exit(0)
}
if (! process.env.AUTH0_CLIENT_ID) {
  console.log("need to set AUTH0_CLIENT_ID")
  process.exit(0)
}

// Initialize express-jwt
var jwt = function() {
  return ejwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
  })
}

module.exports = exports = jwt
