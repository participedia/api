const groups = require("../helpers/groups");
const log = require("winston");

function isUser(req, res, next) {
  try {
    groups.user_has(
      req,
      "Contributors",
      err => {
        log.error("in isUser, user doesn't have Contributors group membership");
        res.status(401).json({
          message: "access denied - user does not have proper authorization",
          error: err
        });
      },
      () => {
        next();
      }
    );
  } catch (e) {
    log.error("Exception in isUser", e);
  }
}

module.exports = isUser;
