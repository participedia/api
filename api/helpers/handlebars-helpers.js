const moment = require("moment");

// links, videos, files and photos have different keys
// on the article and the static text object,
// so mapping the different keys here
// we could change the keys on the static text obj to
// match those on the article to remove the need for this.
const mapArticleKeyToStaticKey = {
  links: "link",
  videos: "video",
  files: "file",
  photos: "photo",
  audio: "audio",
};

function staticMediaText(staticText, name, attr, type) {
  const mappedName = mapArticleKeyToStaticKey[name];
  let key;
  if (name === "links" && attr === "link") {
    key = `${mappedName}_${type}`;
  } else {
    key = `${mappedName}_${attr}_${type}`;
  }
  return staticText[key] || key;
}

module.exports = {
  label: (staticText, name) => staticText[name + "_label"] || name + "_label",
  info: (staticText, name) => staticText[name + "_info"] || name + "_info",
  instructional: (staticText, name) => staticText[name + "_instructional"] || name + "_instructional",
  placeholder: (staticText, name) => staticText[name + "_placeholder"] || name + "_placeholder",
  isEmptyArray: (article, name) => {
    const value = article[name];
    if (value && value.constructor === Array) {
      return value.length === 0;
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
  getKey: (article, name) => {
    if (article[name]) {
      return  article[name].key;
    }
  },
  isSelectedInArray: (article, name, optionKey) => {
    const options = article[name];
    if (options && options.length > 0) {
      return options.find((item) => {
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
    // todo replace with options from article object once they are added
    const tempOptions = [
      {
        "key": "public",
        "lookup_key": "insights_outcomes_value_public",
        "value": "Public Report"
      },
      {
        "key": "public_hearingsmeetings",
        "lookup_key": "insights_outcomes_value_public_hearingsmeetings",
        "value": "Public Hearings/Meetings"
      },
      {
        "key": "traditional",
        "lookup_key": "insights_outcomes_value_traditional",
        "value": "Traditional Media"
      },
      {
        "key": "new",
        "lookup_key": "insights_outcomes_value_new",
        "value": "New Media"
      },
      {
        "key": "both",
        "lookup_key": "facetoface_online_or_both_value_both",
        "value": "Both"
      }
    ];
    return tempOptions;
  },
  getMediaLinkValue(article, name, index, attr) {
    if (!article[name]) return;
    if (!article[name][index]) return;
    return article[name][index][attr];
  },
  mediaLinkFieldName(name, index, attr) {
    return `${name}[${index}][${attr}]`;
  },
  mediaLinkPlaceholder(staticText, name, attr) {
    return staticMediaText(staticText, name, attr, "placeholder");
  },
  mediaLinkLabel(staticText, name, attr) {
    return staticMediaText(staticText, name, attr, "label");
  },
  mediaLinkInstructional(staticText, name, attr) {
    return staticMediaText(staticText, name, attr, "instructional");
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
};
