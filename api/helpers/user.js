var { db, sql } = require("../helpers/db");
var log = require("winston");
var unless = require("express-unless");

function ensureUser(req, res, next) {
  let user = req.user;
  let name = req.header("X-Auth0-Name");
  let auth0UserId = req.header("X-Auth0-UserId");
  if (!user) {
    // not authenticated, let it fail elsewhere
    return next();
  }
  if (user.user_id) {
    // all is well, carry on
    return next();
  }
  db
    .one(sql("../sql/user_by_email.sql"), {
      userEmail: user.email
    })
    .then(function(user) {
      req.user.user_id = user.id;
      next();
    })
    .catch(function(error) {
      // get user.name and then create a new user in our database
      db
        .one(sql("../sql/create_user_id.sql"), {
          userEmail: user.email,
          userName: name,
          auth0UserId: auth0UserId
        })
        .then(function(user) {
          req.user.user_id = user.user_id;
          next();
        })
        .catch(function(error) {
          log.error("Problem creating user", error);
          return res.status(500).json({
            OK: false,
            error: error
          });
        });
    });
}

ensureUser.unless = unless;

module.exports = (exports = { ensureUser });
