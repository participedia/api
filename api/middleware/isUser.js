// "use strict";
// let groups = require("../helpers/groups");
//
// function isUser(req, res, next) {
//   try {
//     groups.user_has(
//       req,
//       "Contributors",
//       function(err) {
//         console.warn(
//           "in isUser, user doesn't have Contributors group membership"
//         );
//         res.status(401).json({
//           message: "access denied - user does not have proper authorization"
//         });
//         return;
//       },
//       function() {
//         next();
//       }
//     );
//   } catch (e) {
//     console.error("Exception in isUser", e);
//   }
// }
//
// module.exports = isUser;
