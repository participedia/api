module.exports = function () {
  return function requireAuthenticatedUser (req, res, next) {
    if (req.user) { return next(); }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
  };
};
