var { db, sql } = require("../helpers/db");
var log = require("winston");

var getUserIdForUser = function (user, cb) {
  log.info("user", user)
  db
    .one(sql("../sql/user_by_email.sql"), {
      userEmail: user.email
    })
    .then(function(user) {
      console.log("found user: %s", user.id);
      cb(user.id);
    })
    .catch(function(error) {
      console.log("ERROR", error)
      db.one(sql("../sql/create_user_id.sql"), {
        userEmail: user.email
      })
      .then(function(user) {
        cb(user.user_id);
      })
      .catch(function (error) {
        log.error("Problem creating user", error);
      })
    });
}

module.exports = exports = { getUserIdForUser}
