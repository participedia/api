const moment = require("moment");
const md5 = require("js-md5");
const aboutData = require("./data/about-data.js");
const socialTagsTemplate = require("./social-tags-template.js");
const SHARED_FIELD_OPTIONS = require("./shared-field-options.js");

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

const i18n = (key, context) => context && context.data && context.data.root.__(key);

module.exports = {
  // transalation helpers
  label: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_label`, context);
  },

  info: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_info`, context);
  },

  hasInstructional: (article, name, context) => {
    const view = context.data.root.params.view;
    const key = `${article.type}_${view}_${name}_instructional`;
    const i18nValue = i18n(key, context);
    return i18nValue !== key;
  },

  instructional: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_instructional`, context);
  },

  placeholder: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_placeholder`, context);
  },

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
    } else if (name === "primary_organizer") {
      return mapIdTitleToKeyValue(staticText["organizations"]);
    } else {
      return staticText[name];
    }
  },

  linkSetPlaceholder: (article, name, attr, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_${attr}_placeholder`, context);
  },

  linkSetLabel: (article, name, attr, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_${attr}_label`, context);
  },

  linkSetInstructional: (article, name, attr, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_${attr}_instructional`, context);
  },

  // article helpers
  getFirstImageForArticle: (article) => {
    if (article.photos && article.photos.length > 0) {
      // search pages return photos for articles in this format
      return article.photos[0].url;
    } else if (article.images && article.images.length > 0) {
      // user profile pages return photos for articles in this format
      return article.images[0];
    }
  },

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

    const selectedItemInArray = SHARED_FIELD_OPTIONS[name].filter(options => options.key === key);
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

  getArrayOfValues: (article, name) => {
    const arrayOfItems = article[name];
    if (!arrayOfItems || arrayOfItems.length === 0) return;
    const value = (key) => {
      const option = SHARED_FIELD_OPTIONS[name].filter(x => x.key === key)[0];
      if (!option) return key;
      return option.value;
    };
    return arrayOfItems.map(item => {
      if (typeof item === "string") {
        return value(item);
      } else {
        return value(item.key);
      }
    });
  },

  getvalue: (article, name) => {
    const item = article[name];
    if (!item) return;

    if (item.hasOwnProperty("value")) {
      // if the item is an object with a value key, return that
      return item.value;
    } else if (!item.hasOwnProperty("value") && item.hasOwnProperty("key")) {
      // if the item doesn't not have a value and has a key, return the key
      return item.key;
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

  isSelectedInArray: (article, name, option) => {
    const options = article[name];
    if (options && options.length > 0) {
      return options.find(item => {
        if (!item) return;
        if (typeof item === "string") {
          return item === option;
        } else {
          return item.key === option.key;
        }
      });
    }
  },

  isSelected: (article, name, optionKey) => {
    const options = article[name];
    if (options) {
      return options.key === optionKey;
    }
  },

  getValueForKey(name, optionKey) {
    const option = SHARED_FIELD_OPTIONS[name].filter(x => x.key === optionKey);
    if (!option[0]) return;
    return option[0].value;
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

  toUpperCase(text) {
    return text.toUpperCase();
  },

  getRandomKey() {
    return parseInt(Math.random() * Math.random() * 1000000, 10);
  },

  isEqual(arg1, arg2) {
    return arg1 === arg2;
  },

  isString(x) {
    return typeof x === "string";
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

  getYearFromDate(date, format) {
    return moment(date).year();
  },
};
