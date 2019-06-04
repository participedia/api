const ARTICLE_TYPE_INDEX_IN_OLD_URL = 4;

const oldDotNetUrlsMappedToId = {
  "/en/methods/participatory-rural-appraisal": 4907,
  "/en/cases/whats-big-idea-hepburn-shire-councils-plan": 4496,
  "/en/organizations/21st-century-dialogue": 4456,
};

const oldDotNetUrlHandler = {
  hasMatch(path) {
    return oldDotNetUrlsMappedToId[path];
  },

  getNewUrl(path) {
    const isCase = path.indexOf("cases") === ARTICLE_TYPE_INDEX_IN_OLD_URL;
    const isMethod = path.indexOf("methods") === ARTICLE_TYPE_INDEX_IN_OLD_URL;
    const isOrganization = path.indexOf("organizations") === ARTICLE_TYPE_INDEX_IN_OLD_URL;

    const id = oldDotNetUrlsMappedToId[path];
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
