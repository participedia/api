var jwt = require('./jwt')()

function userHas (req, groupName, errCB, okCB) {
  try {
    console.log('calling jwt')
    jwt(req, req.res,  function (err) {
      if (err) {
        errCB && errCB(err)
      } else {
        console.log("unhandled error in jwt.userHas", err)
      }
      console.log("err", err)
      user = req.user
      if (user && user.app_metadata && user.app_metadata.authorization &&
          user.app_metadata.authorization.groups) {
          console.log('all good');
        if (user.app_metadata.authorization.groups.indexOf(groupName) === -1) {
          console.log('no group');
          errCB && errCB(err)
        } else {
          console.log('OK');
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
