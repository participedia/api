const log = require("winston");

function userHas(req, groupName, errCB, okCB) {
  try {
    const user = req.user;
    if (
      user &&
      user.app_metadata &&
      user.app_metadata.authorization &&
      user.app_metadata.authorization.groups
    ) {
      if (user.app_metadata.authorization.groups.indexOf(groupName) === -1) {
        errCB && errCB();
      } else {
        okCB && okCB();
      }
    } else {
      errCB("no user");
    }
  } catch (e) {
    log.error("exception in userHas", e);
    errCB("exception in userHas");
  }
}

module.exports = {
  user_has: userHas
};
