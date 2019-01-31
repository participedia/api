const moment = require("moment");
const faqContent = require("./faq-content.js");
const aboutData = require("./data/about-data.js");
const socialTagsTemplate = require("./social-tags-template.js");

function mapIdTitleToKeyValue(options) {
  if (!options) return null;
  return options.map(item => {
    return {
      key: item.id,
      value: item.title,
    };
  });
}

function staticTextValue(staticText, name, type = null) {
  let key;
  if (type) {
    key = `${name}_${type}`;
  } else {
    key = name;
  }

  if (staticText.labels) {
    return staticText.labels[key] || key;
  } else {
    // this makes the static keys work on the reader view for now
    // since the format is different from the edit view
    return staticText[key] || key;
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

module.exports = {
  // transalation helpers
  label: (staticText, name) => staticTextValue(staticText, name, "label"),

  info: (staticText, name) => staticTextValue(staticText, name, "info"),

  instructional: (staticText, name) =>
    staticTextValue(staticText, name, "instructional"),

  placeholder: (staticText, name) =>
    staticTextValue(staticText, name, "placeholder"),

  staticText: (staticText, name) => staticTextValue(staticText, name),

  getStaticOptions: (staticText, name) => {
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

  shareLink(type, req) {
    const url = currentUrl(req);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/home?status=${url}`,
      linkedIn: `https://www.linkedin.com/shareArticle?mini=true&url=${url}`,
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
    return article.type + " Data";
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
    const currentPageNum = req.query && req.query.page;
    if (currentPageNum && parseInt(currentPageNum) !== parseInt(totalPages)) {
      return parseInt(currentPageNum) + 1;
    } else {
      return totalPages;
    }
  },

  // tab helpers
  isTabActive(req, tabName) {
    const tabParam = req.query && req.query.tab;
    // this is kind of hacky -- this will break in the case that when
    // have a default tab with the same name as a non-default tab on another page.
    // tab-contributions is default tab on /user/{id} (user-view)
    // tab-all is default tab on / (home-search)
    const defaultTabs = ['tab-contributions', 'tab-all'];
    // if there is no param, make default tab active
    if ((!tabParam && defaultTabs.indexOf(tabName) > -1) || tabParam === tabName) {
      return "checked";
    }
  },

  // location helpers
  parseLatLng(latitude, longitude) {
    const coords = parseDMS(`${latitude},${longitude}`);
    return `${coords.latitude},${coords.longitude}`;
  },

  // utilities
  currentUrl(req) {
    return currentUrl(req);
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

  // data
  getPartnersData() {
    return aboutData.partners;
  },

  getCommitteesData() {
    return aboutData.committees;
  },

  getContentTypeData() {
    return [
      {
        slug: "cases",
        title: "Case",
        description: "Cases are specific events and instances of participatory politics and governance of all shapes and sizes. Cases can be contemporary or historical, completed, or ongoing."
      },
      {
        slug: "methods",
        title: "Method",
        description: "Methods are the processes and procedures used to guide participatory politics and governance."
      },
      {
        slug: "organizations",
        title: "Organization",
        description: "Organizations are profiles of formal and informal groups that design, implement, or support innovations in participatory politics and governance."
      },
      {
        slug: "tools-techniques",
        title: "Tools & Techniques",
        description: "Description TBD"
      },
    ];
  },

  getYearFromDate(date, format) {
    return moment(date).year();
  },

  parseUser(user) {
    console.log(user)
  }
};
