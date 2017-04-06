let { db, sql } = require("../helpers/db");
let log = require("winston");
let unless = require("express-unless");

function getUserIfExists(req, res, next) {
  let user = req.user;
  if (!user) {
    return next();
  } else {
    db
      .one(sql("../sql/user_by_email.sql"), {
        userEmail: user.email
      })
      .then(function(user) {
        next(user.id);
      })
      .catch(function() {
        next();
      });
  }
}

function ensureUser(req, res, next) {
  let user = req.user;
  let name = req.header("X-Auth0-Name");
  let auth0UserId = req.header("X-Auth0-UserId");
  if (!user) {
    res.status(401).json({
      message: "User must be logged in to perform this function"
    });
  }
  if (!okToEdit(user)) {
    res.status(401).json({
      message: "User is not authorized to add or edit content."
    });
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

function okToEdit(user) {
  // User should be logged in and not be part of the Banned group
  if (
    !(user.app_metadata &&
      user.app_metadata.authorization &&
      user.app_metadata.authorization.groups)
  ) {
    // how do we have a user, but not this metadata?
    return false;
  }
  if (user.app_metadata.authorization.groups.indexOf("Banned") !== -1) {
    return false;
  }
  return true;
}

ensureUser.unless = unless;

module.exports = (exports = { ensureUser, okToEdit, getUserIfExists });
