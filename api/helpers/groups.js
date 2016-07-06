var jwt = require('./jwt')()

function user_has(req, groupName, errCB, okCB) {
  var user = req.user

  jwt(req, req.res, function(err) {
    if (user && user.app_metadata && user.app_metadata.authorization &&
        user.app_metadata.authorization.groups)
    if (user.app_metadata.authorization.groups.indexOf(groupName) == -1) {
      errCB && errCB(err)
    } else {
      okCB && okCB()
    }
  })
}

module.exports = {
  user_has: user_has
};
