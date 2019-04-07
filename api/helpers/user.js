const {
  db,
  as,
  USER_BY_EMAIL,
  USER_BY_ID,
  CREATE_USER_ID
} = require("../helpers/db");

async function getUserOrCreateUser(auth0User) {
  // check if we have a user in our db
  const userByEmail = await db.oneOrNone(USER_BY_EMAIL, {
    userEmail: auth0User.email
  });

  // if we don't have a user yet, create one
  let createdUser;
  if (!userByEmail) {
    createdUser = await db.one(CREATE_USER_ID, {
      userEmail: auth0User.email,
      // if auth0User.name is null, use first part of email address for username
      userName:
        auth0User.name ||
        auth0User.email.substr(0, auth0User.email.indexOf("@")),
      joinDate: auth0User.created_at,
      auth0UserId: auth0User.id,
      bio: "",
      language: "en"
    });
  }

  // we either have an id from userByEmail or createdUser
  const userId =
    (userByEmail && userByEmail.id) || (createdUser && createdUser.user_id);

  // get full user object by id
  result = await db.oneOrNone(USER_BY_ID, {
    userId: userId,
    language: "en"
  });

  return result.user;
}

function okToEdit(user) {
  // User should be logged in and not be part of the Banned group
  if (
    !(
      user.app_metadata &&
      user.app_metadata.authorization &&
      user.app_metadata.authorization.groups
    )
  ) {
    // how do we have a user, but not this metadata?
    // Because that's the way OAuth is configured, duh. No metatdata
    // means the user cannot be in the Banned group, allow editing.
    return true;
  }
  if (user.app_metadata.authorization.groups.includes("Banned")) {
    return false;
  }
  return true;
}

module.exports = exports = {
  okToEdit,
  getUserOrCreateUser
};
