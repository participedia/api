let { db, sql, as } = require("../helpers/db");
let log = require("winston");
let unless = require("express-unless");

async function preferUser(req, res, next) {
  commonUserHandler(false, req, res, next);
}

async function ensureUser(req, res, next) {
  commonUserHandler(true, req, res, next);
}

async function commonUserHandler(required, req, res, next) {
  try {
    let user = req.user;
    let email = req.header("X-Auth0-Name");
    let auth0UserId = req.header("X-Auth0-UserId");
    if (!user) {
      if (required) {
        return res.status(401).json({
          message: "User must be logged in to perform this function"
        });
      } else if (!email) {
        // nothing more we can do here without a user
        return next();
      }
    }
    if (required && !okToEdit(user)) {
      res.status(401).json({
        message: "User is not authorized to add or edit content."
      });
    }
    if (user.user_id) {
      // all is well, carry on, but make sure user_id is a number
      user.user_id = Number(user.user_id);
      return next();
    }
    userObj = await db.oneOrNone(sql("../sql/user_by_email.sql"), {
      userEmail: user && user.email ? user.email : email
    });
    if (userObj) {
      req.user.user_id = userObj.id;
    } else {
      let newUser;
      let pictureUrl = user.picture;
      if (user.user_metadata && user.user_metadata.customPic) {
        pictureUrl = user.user_metadata.customPic;
      }
      console.log(JSON.stringify(req.user));
      newUser = await db.one(sql("../sql/create_user_id.sql"), {
        userEmail: user.email,
        userName: user.name || user.email,
        joinDate: user.created_at,
        auth0UserId: auth0UserId,
        pictureUrl: pictureUrl,
        title: "",
        bio: "",
        affiliation: "",
        location: null
      });
      req.user.user_id = newUser.user_id;
    }
    return next();
  } catch (error) {
    console.trace("Problem creating user", error);
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
preferUser.unless = unless;

module.exports = (exports = { ensureUser, okToEdit, preferUser });
