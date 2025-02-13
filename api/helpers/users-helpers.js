const {
  db,
  as,
  USER_BY_EMAIL,
  USER_BY_ID,
  CREATE_USER_ID,
  USER_DELETE,
} = require("../helpers/db");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

async function getUserOrCreateUser(auth0User, localeLang) {
  // check if we have a user in our db
  const userByEmail = await db.oneOrNone(USER_BY_EMAIL, {
    userEmail: auth0User.email,
  });
  console.log("getUserOrCreateUser 4444444444444444444444444 user by email userByEmail ", !!userByEmail);

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
      language: "en",
    });
  }
  console.log("4444444444444444444444444444444 CREATE_USER_ID createuser done")

  // we either have an id from userByEmail or createdUser
  const userId =
    (userByEmail && userByEmail.id) || (createdUser && createdUser.user_id);

  // get full user object by id
  console.log("4444444444444444444444444444444 USER_BY_ID  await")

  result = await db.oneOrNone(USER_BY_ID, {
    userId: userId,
    language: localeLang,
  });
  console.log("4444444444444444444444444444444 USER_BY_ID  done")
  result.user.auth0_user_id = auth0User.user_id;
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

const setUserAcceptedDate = async (id, currentDate) => {
  try {
    return await db.none(
      "UPDATE users SET accepted_date = ${currentDate} WHERE id = ${id}",
      {
        id: id,
        currentDate: currentDate,
      }
    );
  } catch (err) {
    console.log("setUserAcceptedDate error - ", err);
  }
};

const deleteUser = async (id) => {
  try {
    return await db.none(USER_DELETE,
      {
        id: id,
      }
    );
  } catch (err) {
    console.log("deleteUser error - ", err);
  }
};

const blockUserAuth0 = async user_id => {
  try {
    const response = await auth0Client.users.update({ id: user_id }, { blocked: true });
    return response.data ? response.data : null
  } catch (error) {
    return null;
  }
  // auth0Client.updateUser(
  //   { id: `${user_id}` },
  //   { blocked: true },
  //   (err, auth0User) => {
  //     if (err) {
  //       return console.log(" blockUserAuth0 error " + err);
  //     } else {
  //       return auth0User;
  //     }
  //   }
  // );
};

module.exports = exports = {
  okToEdit,
  getUserOrCreateUser,
  setUserAcceptedDate,
  blockUserAuth0,
  deleteUser,
};
