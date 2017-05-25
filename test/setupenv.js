// For testing, we generate JWTs for pretend users.  Best not to use any secrets.
let jwt = require("jsonwebtoken");
let pem2jwk = require("pem-jwk").pem2jwk;
let keypair = require("keypair");
let nock = require("nock");
let log = require("winston");

// We expect to not have an AUTH0_SECRET
let process = require("process");
process.env.AUTH0_CLIENT_SECRET = "notasecret";
process.env.AUTH0_CLIENT_ID = "either";
process.env.AUTH0_CLIENT_ID = "either";

// test locally
if (process.env.TESTLOCAL === "true") {
  process.env.DATABASE_URL =
    "postgres://" + process.env.USER + "@localhost:5432/participedia-test";
  console.log(
    "Starting test locally using DATABASE_URL %s",
    process.env.DATABASE_URL
  );
}

// We'll create a BEARER_TOKEN environment variable

let userPayload = {
  sub: "1234567890",
  name: "asdasasd Doe",
  email: "joe@example.com",
  user_id: "123",
  app_metadata: {
    authorization: {
      groups: ["Contributors", "Curators"]
    }
  }
};

// taken from https://github.com/auth0/node-jsonwebtoken/issues/315#issuecomment-283136148
pair = keypair();

let publicJWK = pem2jwk(pair.public);
publicJWK.use = "sig";
publicJWK.kid = "this_is_a_constant";

nock("https://participedia.auth0.com/.well-known/jwks.json")
  .get("")
  .reply(200, {
    keys: [publicJWK]
  });

let bearer_token = jwt.sign(userPayload, pair.private, {
  algorithm: "RS256",
  header: { kid: "this_is_a_constant" },
  audience: "https://api.participedia.xyz",
  issuer: `https://participedia.auth0.com/`
});

process.env.BEARER_TOKEN = bearer_token;
process.env.TOKEN_SECRET = pair.public;
try {
  // Doing this just to make sure that we have the right parameters.
  jwt.verify(bearer_token, pair.public, { algorithms: ["RS256"] });
} catch (e) {
  // useful for early detection that something went wrong with signing.
  log.error(JSON.stringify(e));
  throw e;
}

module.exports = {
  user_token: bearer_token,
  user_payload: userPayload
};
