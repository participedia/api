var jwt = require('./jwt')()

function userHas (req, groupName, errCB, okCB) {
  try {
    jwt(req, req.res,  function (err) {
      if (err) {
        errCB && errCB(err)
      } else {
        console.log("unhandled error in jwt.userHas", err)
      }
      user = req.user
      if (user && user.app_metadata && user.app_metadata.authorization &&
          user.app_metadata.authorization.groups) {
        if (user.app_metadata.authorization.groups.indexOf(groupName) === -1) {
          errCB && errCB(err)
        } else {
          okCB && okCB()
        }
      }
    })
  } catch (e) {
    console.log('exception in userHas', e)
  }
}

module.exports = {
  user_has: userHas
}
