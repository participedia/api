var { db, sql } = require("../helpers/db");
var log = require("winston");

var getUserIdForUser = function(req, cb) {
  let user = req.user;
  let name = req.header("X-Auth0-Name");
  let auth0UserId = req.header("X-Auth0-UserId");
  if (user.user_id) {
    return cb(user.user_id);
  }
  db
    .one(sql("../sql/user_by_email.sql"), {
      userEmail: user.email
    })
    .then(function(user) {
      cb(user.id);
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
          cb(user.user_id);
        })
        .catch(function(error) {
          log.error("Problem creating user", error);
        });
    });
};

module.exports = (exports = { getUserIdForUser });
