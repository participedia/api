const moment = require("moment");
const md5 = require("js-md5");
const aboutData = require("./data/about-data.js");
const socialTagsTemplate = require("./social-tags-template.js");

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

function parseDMS(input) {
  // expects input formatted as "0° 0' 0" N,0° 0' 0" E"
  const parts = input.split(/[^\d\w\.]+/);
  return {
    latitude: convertDMSToDD(parts[0], parts[1], parts[2], parts[3]),
    longitude: convertDMSToDD(parts[4], parts[5], parts[6], parts[7]),
  };
}

function convertDMSToDD(degrees, minutes, seconds, direction) {
  let dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

  if (direction === "S" || direction === "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}

const i18n = (key, context) => context && context.data && context.data.root.__(key);

module.exports = {
  // transalation helpers
  label: (name, context) => i18n(`${name}_label`, context),

  info: (name, context) => i18n(`${name}_info`, context),

  instructional: (name, context) => i18n(`${name}_instructional`, context),

  placeholder: (name, context) => i18n(`${name}_placeholder`, context),

  t: (key, context) => i18n(key, context),

  isSelectedLanguage: (lang, context) => {
    if (context && context.data && context.data.root) {
      return lang === context.data.root.req.cookies.locale;
    }
  },

  getArticleOptions: (staticText, name) => {
    // has_components and is_component_of fields use the cases options
    // uses mapIdTitleToKeyValue function to map id/title keys to key/value keys
    if (name === "has_components" || name === "is_component_of") {
      return mapIdTitleToKeyValue(staticText["cases"]);
    } else if (name === "specific_methods_tools_techniques") {
      return mapIdTitleToKeyValue(staticText["methods"]);
    } else {
      return staticText[name];
    }
  },

  linkSetPlaceholder: (name, attr, context) => {
    return i18n(`${name}_${attr}_placeholder`, context);
  },

  linkSetLabel: (name, attr, context) => {
    return i18n(`${name}_${attr}_label`, context);
  },

  linkSetInstructional: (name, attr, context) => {
    return i18n(`${name}_${attr}_instructional`, context);
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

  getArticleKey: (article, name, key) => {
    return article[name] && article[name][key];
  },

  isSelectedInArray: (article, name, optionKey) => {
    const options = article[name];
    if (options && options.length > 0) {
      return options.find(item => {
        return item.key === optionKey;
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
    return moment(article[name]).format(format);
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

  getHomeTabs(context) {
    return [
      { title: i18n("All", context), key: "all" },
      { title: i18n("Cases", context), key: "case" },
      { title: i18n("Methods", context), key: "method" },
      { title: i18n("Organizations", context), key: "organizations" },
    ];
  },

  getUserTabs(context) {
    return [
      { title: i18n("Contributions", context), key: "contributions" },
      { title: i18n("Bookmarks", context), key: "bookmarks" },
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
  parseLatLng(latitude, longitude) {
    const coords = parseDMS(`${latitude},${longitude}`);
    return `${coords.latitude},${coords.longitude}`;
  },

  locationFieldNames() {
    return [
      "address1",
      "address2",
      "city",
      "province",
      "postal_code",
      "country",
      "latitude",
      "longitude"
    ];
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

  isEditView(req) {
    const baseUrls = ["/case", "/method", "/organization", "/user"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("edit") >= 0;
  },

  isReaderView(req) {
    const baseUrls = ["/case", "/method", "/organization"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("edit") === -1;
  },

  isHomeSearchView(req) {
    return req.path === "/";
  },

  isUserView(req) {
    return req.baseUrl === "/user" && req.path.indexOf("edit") === -1;
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

  getYearFromDate(date, format) {
    return moment(date).year();
  },
};
