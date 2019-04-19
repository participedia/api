const moment = require("moment");
const md5 = require("js-md5");
const faqContent = require("./faq-content.js");
const aboutData = require("./data/about-data.js");
const contentTypesData = require("./data/content-types-data.js");
const socialTagsTemplate = require("./social-tags-template.js");
const caseFieldOptions = require("./case-field-options.js");

const LOCATION_FIELD_NAMES = [
  "address1",
  "address2",
  "city",
  "province",
  "postal_code",
  "country",
  "latitude",
  "longitude"
];

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function mapIdTitleToKeyValue(options) {
  if (!options) return null;
  return options.map(item => {
    return {
      key: item.id,
      value: item.title,
    };
  });
}

function staticTextValue(staticText, key, type = null) {
  let newKey;
  if (type) {
    newKey = `${key}_${type}`;
  } else {
    newKey = key;
  }

  if (!staticText) {
    return newKey;
  } else if (staticText.labels) {
    return staticText.labels[newKey] || newKey;
  } else {
    // this makes the static keys work on the reader view for now
    // since the format is different from the edit view
    return staticText[newKey] || newKey;
  }
}

function currentUrl(req) {
  const path = req.originalUrl;
  const host = req.headers.host;
  return `https://${host}${path}`;
}

function getFirstPhotoUrl(article) {
  if (!article.photos) return;
  if (article.photos.length === 0) return;
  return article.photos[0].url;
}

module.exports = {
  // transalation helpers
  label: (staticText, name) => staticTextValue(staticText, name, "label"),

  info: (staticText, name) => staticTextValue(staticText, name, "info"),

  instructional: (staticText, name) =>
    staticTextValue(staticText, name, "instructional"),

  placeholder: (staticText, name) =>
    staticTextValue(staticText, name, "placeholder"),

  t: (staticText, key) => staticTextValue(staticText, key),

  getArticleOptions: (staticText, name) => {
    // has_components and is_component_of fields use the cases options
    // uses mapIdTitleToKeyValue function to map id/title keys to key/value keys
    if (name === "has_components" || name === "is_component_of") {
      return mapIdTitleToKeyValue(staticText["cases"]);
    } else if (name === "specific_methods_tools_techniques") {
      return mapIdTitleToKeyValue(staticText["methods"]);
    } else if (name === "primary_organizer") {
      return mapIdTitleToKeyValue(staticText["organizations"]);
    } else {
      return staticText[name];
    }
  },

  linkSetPlaceholder(staticText, name, attr) {
    return staticTextValue(staticText, `${name}_${attr}`, "placeholder");
  },

  linkSetLabel(staticText, name, attr) {
    return staticTextValue(staticText, `${name}_${attr}`, "label");
  },

  linkSetInstructional(staticText, name, attr) {
    return staticTextValue(staticText, `${name}_${attr}`, "instructional");
  },

  // article helpers
  isEmptyArray: (article, name) => {
    const value = article[name];
    if (value && value.constructor === Array) {
      return value.length === 0;
    }
  },

  isArray: (article, name) => {
    const value = article[name];
    return value && value.constructor === Array;
  },

  getArticleSelectValue: (article, name) => {
    if (!article[name]) return null;

    // some article select fields have values like  { key: "value"},
    // and others like for impact_evidence and formal_evaluation have a
    // string like "value" which represents the key

    let key;
    if(article[name].key) {
      key = article[name].key
    } else {
      key = article[name];
    }

    const selectedItemInArray = caseFieldOptions[name].filter(options => options.key === key);
    if (selectedItemInArray.length > 0) {
      if (selectedItemInArray[0].value !== "") {
        return selectedItemInArray[0].value;
      }
    }
  },

  getArticleSelectKey: (article, name) => {
    if (!article[name]) return;
    if (article[name].hasOwnProperty("key")) {
      return article[name].key;
    } else if (article[name].hasOwnProperty("id")) {
      return article[name].id;
    } else {
      return article[name];
    }
  },

  getvalue: (article, name) => {
    const item = article[name];
    if (item && item.hasOwnProperty("value")) {
      // if the item is an object with a value key, return that
      return item.value;
    } else {
      // otherwise just return the item
      return item;
    }
  },

  hasValue: (article, name) => {
    if (!article){
      return 'undefined ' + name;
    }
    const item = article[name];

    // potential falsey values
    // null
    // ""
    // []
    // { "value": "" }

    return (
      item !== null &&
      item !== "" &&
      !(item.hasOwnProperty("length") && item.length === 0) &&
      !(item.hasOwnProperty("value") && item.value === "")
    );
  },

  getKey: (article, name) => {
    if (article[name]) {
      return article[name].key;
    }
  },

  getArticleListKey: (article, name, key) => {
    return article[name] && article[name][key];
  },

  isSelectedInArray: (article, name, optionKey) => {
    const options = article[name];
    if (options && options.length > 0) {
      return options.find(item => {
        return item && item.key === optionKey;
      });
    }
  },

  isSelected: (article, name, optionKey) => {
    const options = article[name];
    if (options) {
      return options.key === optionKey;
    }
  },

  getOptions: (article, name) => {
    return article[name];
  },

  getLinkSetValue(article, name, index, attr) {
    if (!article[name]) return;
    if (!article[name][index]) return;
    return article[name][index][attr];
  },

  linkSetFieldName(name, index, attr) {
    return `${name}[${index}][${attr}]`;
  },

  moment(date, format) {
    return moment(date).format(format);
  },

  formatDate(article, name, format) {
    if (article[name] && article[name] !== "") {
      return moment(article[name]).format(format);
    }
  },

  getCaseEditSubmitType(req) {
    if (req.query.full === "1") {
      return "full";
    } else {
      return "quick";
    }
  },

  shareLink(type, article, req) {
    const url = currentUrl(req);
    const title = article.title;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/home?status=${title} - ${url}`,
      linkedIn: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    };
    return shareUrls[type];
  },

  hasPhoto(article) {
    return article.photos && article.photos.length > 0;
  },

  getFirstPhotoUrl(article) {
    return getFirstPhotoUrl(article);
  },

  isReaderPage(params) {
    return params && params.view && params.view === "view";
  },

  socialTagsTemplate(article, req) {
    if (!article) return;

    const url = currentUrl(req);
    const title = article.title;
    const description = article.description;
    const imageUrl = getFirstPhotoUrl(article);

    return socialTagsTemplate(title, description, url, imageUrl);
  },

  articleDataTitle(article) {
    return toTitleCase(article.type + " Data");
  },

  // search layout helpers
  cardLayoutType(req) {
    const defaultLayoutType = "grid";
    const type = req.query && req.query.layout;
    return type ? type : defaultLayoutType;
  },

  // pagination helpers
  paginationNumResults(cards, req) {
    const pageNum = parseInt(req.query.page);
    if (pageNum > 1) {
      return `${cards.length * (pageNum - 1) + 1} - ${cards.length * pageNum}`;
    } else {
      return "1 - " + cards.length;
    }
  },

  getCurrentPage(req) {
    if (req.query && req.query.page) {
      return req.query.page;
    } else {
      return 1;
    }
  },

  getPrevPageNum(req) {
    const currentPageNum = req.query && req.query.page;
    if (currentPageNum) {
      return parseInt(currentPageNum) - 1;
    } else {
      return 1;
    }
  },

  getNextPageNum(req, totalPages) {
    const currentPageNum = req.query && parseInt(req.query.page) || 1;
    if (currentPageNum !== parseInt(totalPages)) {
      return currentPageNum + 1;
    } else {
      return totalPages;
    }
  },

  // tab helpers
  isTabActive(req, tabName) {
    const tabParam = req.query && req.query.selectedCategory;
    // this is kind of hacky -- this will break in the case that when
    // have a default tab with the same name as a non-default tab on another page.
    // tab-contributions is default tab on /user/{id} (user-view)
    // tab-all is default tab on / (home-search)
    const defaultTabs = ['contributions', 'all'];
    // if there is no param, make default tab active
    if ((!tabParam && defaultTabs.indexOf(tabName) > -1) || tabParam === tabName) {
      return "checked";
    }
  },

  getHomeTabs() {
    return [
      { title: "All", key: "all" },
      { title: "Cases", key: "case" },
      { title: "Methods", key: "method" },
      { title: "Organizations", key: "organizations" },
    ];
  },

  getUserTabs() {
    return [
      { title: "Contributions", key: "contributions" },
      { title: "Bookmarks", key: "bookmarks" },
    ];
  },

  isSelectedUserTab(req, category) {
    const defaultTab = "contributions";
    if (req.query.selectedCategory) {
      return req.query.selectedCategory === category;
    } else if (category === defaultTab) {
      return true;
    }
  },

  isSelectedHomeTab(req, category) {
    const defaultTab = "all";
    if (req.query.selectedCategory) {
      return req.query.selectedCategory === category;
    } else if (category === defaultTab) {
      return true;
    }
  },

  // location helpers
  hasLocationData(article) {
    let hasLocationData = false;
    LOCATION_FIELD_NAMES.forEach((fieldName) => {
      if (article[fieldName]) {
        hasLocationData = true;
      }
    });
    return hasLocationData;
  },

  getLocationValue(article) {
    const locationValues = LOCATION_FIELD_NAMES.map(field => {
      if (field !== "latitude" && field !== "longitude") {
        return article[field];
      }
    }).filter(field => field);

    return locationValues.join(", ");
  },

  locationFieldNames() {
    return LOCATION_FIELD_NAMES;
  },

  // user profile
  getInitials(username) {
    if (!username) return;

    let initials = "";
    const splitUsername = username.split(" ");

    if (splitUsername.length > 1) {
      // if there are 2 names in the string, extract each first letter
      initials = splitUsername[0].charAt(0) + splitUsername[1].charAt(0);
    } else {
      // otherwise just use the first letter of the string
      initials = username.charAt(0);
    }

    return initials.toUpperCase();
  },

  isProfileOwner(user, profile) {
    if (!user || !profile) return false;

    return user.id === profile.id;
  },

  getGravatarUrl(email) {
    if (!email) return;

    const emailHash = md5(email);
    return `https://www.gravatar.com/avatar/${emailHash}`;
  },

  getContributionsForProfile(profile) {
    const contributionTypes = ["cases", "methods", "organizations"];
    // merge all article types into 1 array
    let allContributions = [];
    contributionTypes.forEach(type => {
      allContributions = allContributions.concat(profile[type]);
    });
    return allContributions;
  },

  // utilities
  currentUrl(req) {
    return currentUrl(req);
  },

  isNewView(req) {
    const baseUrls = ["/case", "/method", "/organization"];
    return baseUrls.includes(req.baseUrl) &&
      req.path.indexOf("new") === 1;
  },

  isEditView(req) {
    const baseUrls = ["/case", "/method", "/organization", "/user"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("edit") >= 0;
  },

  isReaderView(req) {
    const baseUrls = ["/case", "/method", "/organization"];
    return baseUrls.includes(req.baseUrl) &&
      req.path.indexOf("edit") === -1 &&
      req.path.indexOf("new") !== 1;
  },

  isHomeSearchView(req) {
    return req.path === "/";
  },

  isUserView(req) {
    return req.baseUrl === "/user" && req.path.indexOf("edit") === -1;
  },

  getFaqContent() {
    // todo: get this as translated text from the server
    return faqContent;
  },

  toUpperCase(text) {
    return text.toUpperCase();
  },

  getRandomKey() {
    return parseInt(Math.random() * Math.random() * 1000000, 10);
  },

  isEqual(arg1, arg2) {
    return arg1 === arg2;
  },

  sanitizeName(name) {
    if (!name) return;
    // if name contains @, assume it's an email address, and strip the domain
    // so we are not sharing email address' publicly
    const atSymbolIndex = name.indexOf("@");
    if (atSymbolIndex > 0) {
      return name.substr(0, atSymbolIndex);
    } else {
      return name;
    }
  },

  // data
  getPartnersData() {
    return aboutData.partners;
  },

  getCommitteesData() {
    return aboutData.committees;
  },

  getStaffMembers() {
    return aboutData.staff.members;
  },

  getContentTypeData() {
    return contentTypesData;
  },

  getYearFromDate(date, format) {
    return moment(date).year();
  },
};
