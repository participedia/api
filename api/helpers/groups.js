function userHas(req, groupName, errCB, okCB) {
  try {
    user = req.user;
    if (
      user &&
      user.app_metadata &&
      user.app_metadata.authorization &&
      user.app_metadata.authorization.groups
    ) {
      if (user.app_metadata.authorization.groups.indexOf(groupName) === -1) {
        errCB && errCB(err);
      } else {
        okCB && okCB();
      }
    } else {
      errCB("no user");
    }
  } catch (e) {
    console.log("exception in userHas", e);
    errCB("exception in userHas");
  }
}

module.exports = {
  user_has: userHas
};
