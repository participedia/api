const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const checkJwtRequired = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://participedia.auth0.com/.well-known/jwks.json`
  }),
  credentialsRequired: true,
  issuer: `https://participedia.auth0.com/`,
  algorithms: ["RS256"]
});

const checkJwtOptional = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://participedia.auth0.com/.well-known/jwks.json`
  }),
  credentialsRequired: false,
  issuer: `https://participedia.auth0.com/`,
  algorithms: ["RS256"]
});

module.exports = { checkJwtRequired, checkJwtOptional };
