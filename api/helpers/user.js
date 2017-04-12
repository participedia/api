let { db, sql, as } = require("../helpers/db");
let log = require("winston");
let unless = require("express-unless");

const getUserIfExists = async req => {
  let user = req.user;
  if (user) {
    user = await db.one(sql("../sql/user_by_email.sql"), {
      userEmail: user.email
    });
    user.id;
  } else {
    null;
  }
};

async function ensureUser(req, res, next) {
  try {
    let user = req.user;
    let name = req.header("X-Auth0-Name");
    let auth0UserId = req.header("X-Auth0-UserId");
    console.log("ENSURE USER", user);
    if (!user) {
      return res.status(401).json({
        message: "User must be logged in to perform this function"
      });
    }
    if (!okToEdit(user)) {
      res.status(401).json({
        message: "User is not authorized to add or edit content."
      });
    }
    if (user.user_id) {
      // all is well, carry on, but make sure user_id is a number
      user.user_id = as.number(user.user_id);
      console.log("ALL IS WELL");
      return next();
    }
    console.log("GETTNG USER BY EMAIL", user.email);
    userObj = await db.oneOrNone(sql("../sql/user_by_email.sql"), {
      userEmail: user.email
    });
    console.log("GOT USER", userObj);
    if (userObj) {
      req.user.user_id = userObj.id;
    } else {
      console.log("INSERTING USER");
      req.user.id = await db.one(sql("../sql/create_user_id.sql"), {
        userEmail: user.email,
        userName: name,
        joinDate: user.created_at,
        auth0UserId: auth0UserId
      });
    }
    next();
  } catch (error) {
    log.error("Problem creating user", error);
    return res.status(500).json({
      OK: false,
      error: error
    });
  }
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
