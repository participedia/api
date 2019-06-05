const OLD_DOT_NET_URLS_MAP = require("./old-dot-net-urls-map.json");

const ARTICLE_TYPE_INDEX_IN_OLD_URL = 4;

const oldDotNetUrlHandler = {
  hasMatch(path) {
    return OLD_DOT_NET_URLS_MAP[path];
  },

  getNewUrl(path) {
    const isCase = path.indexOf("cases") === ARTICLE_TYPE_INDEX_IN_OLD_URL;
    const isMethod = path.indexOf("methods") === ARTICLE_TYPE_INDEX_IN_OLD_URL;
    const isOrganization = path.indexOf("organizations") === ARTICLE_TYPE_INDEX_IN_OLD_URL;

    const id = OLD_DOT_NET_URLS_MAP[path];
    let newUrl = "";
    if (isCase) {
      newUrl = "/case/" + id;
    } else if (isMethod) {
      newUrl = "/method/" + id;
    } else if (isOrganization) {
      newUrl = "/organization/" + id;
    }
    return newUrl;
  }
};

module.exports = oldDotNetUrlHandler;
