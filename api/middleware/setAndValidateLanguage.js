let { find } = require("lodash");
const { SUPPORTED_LANGUAGES } = require("./../../constants.js");

const isValidUrlLanguage = (lang) => {
  return find(SUPPORTED_LANGUAGES, {twoLetterCode: lang});
};

module.exports = function() {
  return function setAndValidateLanguage(req, res, next) {
    if (req.params.language && isValidUrlLanguage(req.params.language) && req.cookies.locale != req.params.language) {
      const currentUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
      res.cookie("locale", req.params.language);
      return res.redirect(currentUrl);
    } else if (req.params.language && !isValidUrlLanguage(req.params.language)) {
      let urlPathMeta = req.path.split('/');
      let thingID = urlPathMeta[1];
      const currentUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/${thingID}`;
      return res.redirect(currentUrl);
    }
    return next();
  };
};
