// isPostOrPutUser.js
const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users update:users'
});

module.exports = function () {
    return async function isPostOrPutUser(req, res, next) {        
        
        const auth0User = await auth0Client.getUser({id: `${req.user.auth0_user_id}`});
        if (auth0User && !auth0User.blocked) {
            return next();
        }
        req.logout();
        res.writeHead(301, { Location: '/logout' });
        res.end();
    };
};
