// isPostOrPutUser.js
const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

const handleInvalidUser = (req, res) => {
  req.logout();
  res.writeHead(301, { Location: "/logout" });
  res.end();
};

const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
      else throw error;
    }
  }
};

module.exports = function () {
  return async function isPostOrPutUser(req, res, next) {
    retry(() => auth0Client.users.get({ id: req.user.auth0_user_id }))
    .then(auth0User => {
      if (auth0User && !auth0User.blocked) next();
      else handleInvalidUser(req, res);
    })
    .catch(error => {
      console.error("Error fetching user after retries:", error);
      handleInvalidUser(req, res);
    });
  };
};

// module.exports = function() {
//   return async function isPostOrPutUser(req, res, next) {
//     auth0Client.getUser(
//       { id: `${req.user.auth0_user_id}` },
//       (err, auth0User) => {
//         if (auth0User && !auth0User.blocked) {
//           return next();
//         } else {
//           return handleInvalidUser(req, res);
//         }
//       }
//     );
//   };
// };
