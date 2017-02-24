// For testing, we generate JWTs for pretend users.  Best not to use any secrets.
var jwt = require('jsonwebtoken')
var test = require('tape')

// We expect to not have an AUTH0_SECRET
var process = require('process')
process.env.AUTH0_CLIENT_SECRET = 'notasecret'
process.env.AUTH0_CLIENT_ID = 'either'
process.env.AUTH0_CLIENT_ID = 'either'

// We'll create a BEARER_TOKEN environment variable

var userPayload = {
  "sub": "1234567890",
  "name": "asdasasd Doe",
  "user_id": "123",
  "app_metadata": {
    "authorization": {
      "groups": [
        "Contributors",
        "Curators"
      ]
    }
  }
}

var bearer_token = jwt.sign(
  userPayload,
  process.env.AUTH0_CLIENT_SECRET
)
process.env.BEARER_TOKEN = bearer_token
// jwt.verify(process.env.BEARER_TOKEN, process.env.AUTH0_CLIENT_SECRET)

module.exports = {
  user_token: bearer_token,
  user_payload: userPayload
}
