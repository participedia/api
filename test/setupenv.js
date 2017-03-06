// For testing, we generate JWTs for pretend users.  Best not to use any secrets.
const jwt = require("jsonwebtoken");

// We expect to not have an AUTH0_SECRET
process.env.AUTH0_CLIENT_SECRET = "notasecret";
process.env.AUTH0_CLIENT_ID = "either";
process.env.AUTH0_CLIENT_ID = "either";

// test locally
if (process.env.TESTLOCAL === "true") {
  process.env.DATABASE_URL = `postgres://${process.env.USER}@localhost:5432/participedia`;
}

// We'll create a BEARER_TOKEN environment variable

const userPayload = {
  sub: "1234567890",
  name: "asdasasd Doe",
  user_id: "123",
  app_metadata: {
    authorization: {
      groups: ["Contributors", "Curators"]
    }
  }
};

const bearer_token = jwt.sign(userPayload, process.env.AUTH0_CLIENT_SECRET);
process.env.BEARER_TOKEN = bearer_token;
// jwt.verify(process.env.BEARER_TOKEN, process.env.AUTH0_CLIENT_SECRET)

module.exports = {
  user_token: bearer_token,
  user_payload: userPayload
};
