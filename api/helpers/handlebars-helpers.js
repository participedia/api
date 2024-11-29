const fs = require("fs");
const moment = require("moment");
const md5 = require("js-md5");
const aboutData = require("./data/about-data.js");
const socialTagsTemplate = require("./social-tags-template.js");
const sharedFieldOptions = require("./shared-field-options.js");
const searchFiltersList = require("./search-filters-list.js");
const countries = require("./countries.js");
const { SUPPORTED_LANGUAGES } = require("../../constants.js");
const { searchFilterKeyLists, searchFilterKeys } = require("./things");

const LOCATION_FIELD_NAMES = [
  "address1",
  "address2",
  "city",
  "province",
  "postal_code",
  "country",
  "latitude",
  "longitude",
];

const PARTNER_TEAM = JSON.parse(
  fs.readFileSync("api/helpers/data/team.json", "utf8")
);

function setMomentLocale(context) {
  const req = context.data.root.req;
  const locale = req.cookies.locale;
  if (locale) {
    moment.locale(locale);
  }
}

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

function currentUrl(req, articleId = null) {
  const path = req.originalUrl;
  const host = req.headers.host;
  if(articleId){
    const updatedPath = path.replace(/[^/]+$/, articleId);
    return `https://${host}${updatedPath}`; 
  }
  return `https://${host}${path}`;
}

function getFirstLargeImageForArticle(article) {
  if (article.photos && article.photos.length > 0) {
    return encodeURI(article.photos[0].url);
  }
}

function randomTexture() {
  let index = Math.floor(Math.random() * 6) + 1;
  return `/images/texture_${index}.svg`;
}

function getFirstThumbnailImageForArticle(article) {
  let url = getFirstLargeImageForArticle(article);

  if (url) {
    let imagePath = "thumbnail";

    // Handle existing GIF by opening it from the raw folder
    if (url.indexOf(".gif") >= 0) {
      imagePath = "raw";
    }

    return url.replace(
      process.env.AWS_UPLOADS_URL,
      `${process.env.AWS_UPLOADS_URL}${imagePath}/`
    );
  } else {
    article.photos = [{ url: randomTexture() }];

    return article.photos[0].url;
  }
}

function filterCollections(req, name, context) {
  let query = req.query[name];
  if (query) {
    let keyList = Object.keys(req.query);
    let keys = keyList.filter(item => item !== "selectedCategory");
    let arr = query.split(",");
    let value = [];
    for (let i in keys) {
      for (let x in arr) {
        if (keys[i] === "country") {
          let category = i18n(`country_label`, context);
          value.push(`${category} includes`);
          value.push(req.query.country.replace(/,/g, ", "));
        } else {
          if (keys[i] !== "query") {
            if (sharedFieldOptions[keys[i]].includes(arr[x])) {
              let str = `name:${keys[i]}-key:${arr[x]}`;
              let category = i18n(
                `${req.query.selectedCategory}_view_${keys[i]}_label`,
                context
              );
              value.push(`${category} includes`);
              value.push(i18n(str, context));
            }
          }
        }
      }
    }
    return [...new Set(value)];
  }
}

function typeFromReq(req) {
  let cat = singularLowerCase(req.query.selectedCategory || "Alls");
  return cat === "all" ? "thing" : cat;
}

const singularLowerCase = name =>
  (name.slice(-1) === "s" ? name.slice(0, -1) : name).toLowerCase();

function getPageTitle(req, article, context) {
  const path = req.route && req.route.path;
  const is404 = context.data.exphbs.view === "404";

  const titleByPath = {
    "/": "Participedia",
    "/about": i18n("About", context) + " – Participedia",
    "/teaching": i18n("Teaching", context) + " – Participedia",
    "/research": i18n("Research", context) + " – Participedia",
    "/404":
      i18n("Sorry, this page cannot be found", context) + " – Participedia",
  };
  if (article && article.title) {
    return article.title + " – Participedia";
  } else if (titleByPath[path]) {
    return titleByPath[path];
  } else if (is404) {
    return titleByPath["/404"];
  } else {
    return titleByPath["/"];
  }
}

function concactArr(arr) {
  let str = "where";
  for (let i = 0; i < arr.length; i++) {
    if (i === arr[i].length - 1) {
      str += " and";
    }
    for (let j = 0; j < arr[i].length; j++) {
      str += ` ${arr[i][j]}`;
    }
  }
  return str;
}

const i18n = (key, context, locale = undefined) => {
  if (locale && typeof locale === "string") {
    return (
      context && context.data && context.data.root.__({ phrase: key, locale })
    );
  } else {
    return context && context.data && context.data.root.__(key);
  }
};

module.exports = {
  toJSON: obj => {
    return JSON.stringify(obj);
  },

  useInspectlet: () => {
    return (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
    );
  },

  getLanguageSelectorTabs: context => {
    return [
      { title: i18n("English", context), key: "en" },
      { title: i18n("French", context), key: "fr" },
      { title: i18n("German", context), key: "de" },
      { title: i18n("Spanish", context), key: "es" },
      { title: i18n("Chinese", context), key: "zh" },
      { title: i18n("Italian", context), key: "it" },
      { title: i18n("Portugese", context), key: "pt" },
      { title: i18n("Dutch", context), key: "nl" },
    ];
  },

  setSelectedLanguageArticle: (articles, context) => {
    return articles[req.cookies.locale];
  },

  // transalation helpers
  getLocalizedTermsOfUsePartial: context => {
    const locale = context.data.root.locale || "en";
    return `terms-of-use-${locale}`;
  },

  getTermsOfUsePartialEnglish: context => {
    return "terms-of-use-en";
  },
  getReCaptchaSiteKey: context => {
    return process.env.GOOGLE_SITE_KEY;
  },

  searchFilterLabel: (type, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${type}_${view}_${name}_label`, context);
  },

  label: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_label`, context);
  },

  hasInfo: (article, name, context) => {
    const view = context.data.root.params.view;
    const key = `${article.type}_${view}_${name}_info`;
    const i18nValue = i18n(key, context);
    return i18nValue !== key;
  },

  hasLocaleInfo: (article, name, context) => {
    const view = context.data.root.params.view;
    const key = `${article.type}_${view}_${name}_locale`;
    const i18nValue = i18n(key, context);
    return i18nValue !== key;
  },

  localeInfo: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_locale`, context);
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

  mapArticleCardPhrases: context => {
    return JSON.stringify({
      Featured_Case: i18n("Featured Case", context),
      Featured_Organization: i18n("Featured Organization", context),
      case: i18n("Case", context),
      organization: i18n("Organization", context),
    });
  },

  featuredCarouselPhrases: context => {
    return JSON.stringify({
      View_Case: i18n("View Case", context),
      View_Method: i18n("View Method", context),
      View_Organization: i18n("View Organization", context),
      View_Collection: i18n("View Collection", context),
    });
  },

  placeholder: (article, name, context) => {
    const view = context.data.root.params.view;
    return i18n(`${article.type}_${view}_${name}_placeholder`, context);
  },

  languageSelectorPlaceholder: context => {
    return i18n(`language_select_placeholder`, context);
  },

  getFeaturedEntryViewDisplayText: (type, context) => {
    return i18n(`View ${type}`, context);
  },

  t: (key, context) => i18n(key, context),

  getTranslatedEntryPlaceholders: (article, context) => {
    const type = article.type;
    const placeholders = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
      placeholders[lang.twoLetterCode] = {
        title: i18n(
          `${type}_edit_title_placeholder`,
          context,
          lang.twoLetterCode
        ),
        description: i18n(
          `${type}_edit_description_placeholder`,
          context,
          lang.twoLetterCode
        ),
        body: i18n(
          `${type}_edit_body_placeholder`,
          context,
          lang.twoLetterCode
        ),
      };
    });
    return JSON.stringify(placeholders);
  },

  getLocale(context) {
    const req = context.data.root.req;
    if (req.cookies.locale) {
      return req.cookies.locale;
    } else {
      return "en";
    }
  },

  getLocalizedLanguageLabel: context => {
    const req = context.data.root.req;
    const locale = req && req.cookies.locale;

    const language = SUPPORTED_LANGUAGES.filter(lang => {
      return lang.twoLetterCode === locale;
    });
    if (language.length > 0) {
      return i18n(language[0].name, context);
    } else {
      return "missing language";
    }
  },

  getLanguageOptions: () => {
    return SUPPORTED_LANGUAGES;
  },

  booleanCheck: value => {
    return !!value;
  },

  getOriginalLanguageValueForEditForm: (article, context) => {
    const req = context.data.root.req;
    return req.cookies.locale|| article.original_language || "en";
  },

  shouldShowOriginalLanguageAlert: (article, context) => {
    const req = context.data.root.req;
    return (
      article.original_language &&
      article.original_language !== req.cookies.locale
    );
  },

  isSelectedLanguage: (lang, context) => {
    const req = context.data.root.req;
    return lang === req.cookies.locale;
  },

  getArticleOptions: (staticText, name, context) => {
    // has_components and is_component_of fields use the cases options
    // uses mapIdTitleToKeyValue function to map id/title keys to key/value keys
    if (name === "is_component_of") {
      return mapIdTitleToKeyValue(staticText["cases"]);
    } else if (name === "specific_methods_tools_techniques") {
      return mapIdTitleToKeyValue(staticText["methods"]);
    } else if (name === "primary_organizer") {
      return mapIdTitleToKeyValue(staticText["organizations"]);
    } else if (name === "collections") {
      return mapIdTitleToKeyValue(staticText["collections"]);
    } else if (["title", "description", "body"].includes(name)) {
      return SUPPORTED_LANGUAGES.map(item => {
        return item.twoLetterCode;
        // };
      });
    } else {
      return staticText[name];
    }
  },

  // debuggerFn: (data = null, context) => {
  //   console.debug(data, context);
  //   // debugger;
  // },

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
    return i18n(
      `${article.type}_${view}_${name}_${attr}_instructional`,
      context
    );
  },

  i18nEditFieldValue: (
    name,
    option,
    locale = null,
    useNoKey = false,
    context
  ) => {
    const defaultKey = !useNoKey
      ? `name:${name}-key:${option}`
      : `name:${option}`;
    const longKey = `${defaultKey}-longValue`;
    let i18nValue;
    let i18nLongValue;
    if (locale) {
      i18nValue = i18n(defaultKey, context, locale);
      i18nLongValue = i18n(longKey, context, locale);
    } else {
      i18nValue = i18n(defaultKey, context);
      i18nLongValue = i18n(longKey, context);
    }

    const fieldNamesMappedToListOfArticles = {
      is_component_of: "cases",
      specific_methods_tools_techniques: "methods",
      primary_organizer: "organizations",
    };

    // if the name is one that maps to list of articles return that value
    if (Object.keys(fieldNamesMappedToListOfArticles).includes(name)) {
      const articleType = fieldNamesMappedToListOfArticles[name];
      const options = context.data.root.static[articleType];
      return option.value;
    }

    // if there is a longValue, return that
    // otherwise return the default value
    else if (i18nLongValue !== longKey) {
      return i18nLongValue;
    } else {
      return i18nValue;
    }
  },

  // article helpers
  getOriginalLanguageAlertText: (article, context) => {
    const __ =
      context && context.data && context.data.root && context.data.root.__;
    const languageItem = SUPPORTED_LANGUAGES.filter(language => {
      return language.twoLetterCode === article.original_language;
    });

    if (languageItem.length !== 1) return;

    return __(
      "This entry was originally added in %s.",
      `${i18n(languageItem[0].name, context)}`
    );
  },

  originalLanguageModalBody: context => {
    return `
      <p>${i18n("faq_a14_p1", context)}</p>
      <p>${i18n("faq_a14_p2", context)}</p>
      <p>${i18n("faq_a14_p3", context)}</p>
      <p>${i18n("faq_a14_p4", context)}</p>
    `;
  },

  shouldShowCompletenessPrompt: article => {
    if (article.completeness && article.completeness !== "complete") {
      return true;
    } else {
      return false;
    }
  },

  shouldShowVerifyEmail: emailNotVerified => {
    if (!emailNotVerified) {
      return false;
    }
    return (
      "<a href='/resend-verification/" + emailNotVerified + "' target='_blank'>"
    );
  },

  getCompletenessPrompt: (article, context) => {
    if (!article.completeness || article.completeness === "complete") return;

    if (context && context.data && context.data.root) {
      const articleEditLink = `/${article.type}/${article.id}/edit?full=1`;
      return context.data.root.__(
        `completeness.${article.completeness}_alert`,
        "<strong>",
        "</strong>",
        `<a href='${articleEditLink}'>`,
        "</a>"
      );
    }
  },

  getCompletenessModalHeader: (article, context) => {
    if (!article.completeness || article.completeness === "complete") return;

    const headerByStatus = {
      stub: i18n("completeness.Stub", context),
      partial_content: i18n("completeness.Partial", context),
      partial_citations: i18n(
        "completeness.Citations/Footnotes Needed",
        context
      ),
      partial_editing: i18n(
        "completeness.Grammar/Spelling Edits Needed",
        context
      ),
    };

    return headerByStatus[article.completeness];
  },

  getCompletenessModalText: (article, context) => {
    const __ =
      context && context.data && context.data.root && context.data.root.__;

    if (!__ && (!article.completeness || article.completeness === "complete"))
      return;

    const stubText = `
      <p>${__("completeness.stub_modal_text_1")}</p>

      <p>${__(
        "completeness.general_modal_text_2",
        "<a href='mailto:communications@participedia.net'>communications@participedia.net</a>"
      )}</p>

      <p>${__(
        "completeness.general_modal_text_3",
        "<a href='https://docs.google.com/document/d/19Pc9qL3H1SxSByuQY1HxLOgbbMQpnnxlicdMGuC78Wg/edit' target='_blank'>",
        "</a>"
      )}</p>
    `;

    const partialContentText = `
      <p>${__("completeness.partial_content_modal_text_1")}</p>

      <p>${__(
        "completeness.general_modal_text_2",
        "<a href='mailto:communications@participedia.net'>communications@participedia.net</a>"
      )}</p>

      <p>${__(
        "completeness.general_modal_text_3",
        "<a href='https://docs.google.com/document/d/19Pc9qL3H1SxSByuQY1HxLOgbbMQpnnxlicdMGuC78Wg/edit' target='_blank'>",
        "</a>"
      )}</p>
    `;

    const partialCitationsText = `
      <p>${__("completeness.partial_citation_modal_text_1")}</p>

      <p>${__(
        "completeness.general_modal_text_2",
        "<a href='mailto:communications@participedia.net'>communications@participedia.net</a>"
      )}</p>

      <p>${__(
        "completeness.general_modal_text_3",
        "<a href='https://docs.google.com/document/d/19Pc9qL3H1SxSByuQY1HxLOgbbMQpnnxlicdMGuC78Wg/edit' target='_blank'>",
        "</a>"
      )}</p>
    `;

    const partialEditingText = `
      <p>${__("completeness.partial_editing_modal_text_1")}</p>

      <p>${__(
        "completeness.general_modal_text_2",
        "<a href='mailto:communications@participedia.net'>communications@participedia.net</a>"
      )}</p>

      <p>${__(
        "completeness.general_modal_text_3",
        "<a href='https://docs.google.com/document/d/19Pc9qL3H1SxSByuQY1HxLOgbbMQpnnxlicdMGuC78Wg/edit' target='_blank'>",
        "</a>"
      )}</p>
    `;

    const textByStatus = {
      stub: stubText,
      partial_content: partialContentText,
      partial_citations: partialCitationsText,
      partial_editing: partialEditingText,
    };

    return textByStatus[article.completeness];
  },

  isLinkableTerm: (article, name) => {
    const articleToKeyMap = {
      organization: "organizations",
      method: "method",
      case: "case",
    };

    // get all the keys that we are currently filtering on from the search filters list
    const supportedFilters = [].concat.apply(
      [],
      searchFiltersList[articleToKeyMap[article.type]].map(section => {
        return section.fieldNameKeys.map(key => key);
      })
    );

    return supportedFilters.includes(name);
  },

  getSearchLinkForTerm: (article, name, key) => {
    if (article.type === "organization") {
      return `/search?selectedCategory=${article.type}s&${name}=${key}`;
    } else {
      return `/search?selectedCategory=${article.type}&${name}=${key}`;
    }
  },

  getFirstLargeImageForArticle: article => {
    return getFirstLargeImageForArticle(article);
  },

  getFirstThumbnailImageForArticle: article => {
    return getFirstThumbnailImageForArticle(article);
  },

  encodeURI: url => {
    return encodeURI(url);
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

  getArticleSelectValue: (article, name, context) => {
    if (!article[name]) return null;

    // some article select fields have values like  { key: "value"},
    // and others like for impact_evidence and formal_evaluation have a
    // string like "value" which represents the key

    let key;
    if (article[name].key) {
      key = article[name].key;
    } else {
      key = article[name];
    }

    return i18n(`name:${name}-key:${key}`, context);
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

  getLocalizedValuesForKeys: (article, name, context) => {
    const arrayOfItems = article[name];
    if (!arrayOfItems || arrayOfItems.length === 0) return;

    return arrayOfItems.map(item => {
      if (typeof item === "string") {
        return {
          key: item,
          localizedValue: i18n(`name:${name}-key:${item}`, context),
        };
      } else {
        return {
          key: item.key,
          localizedValue: i18n(`name:${name}-key:${item.key}`, context),
        };
      }
    });
  },

  editAutocompleteGetSelectedItems: (article, name) => {
    const selectedItems = article[name];
    if (!selectedItems) return;

    if (Array.isArray(selectedItems) && selectedItems.length === 0) {
      return null;
    } else if (Array.isArray(selectedItems) && selectedItems.length > 0) {
      return selectedItems;
    } else {
      return [selectedItems];
    }
  },

  editAutocompleteGetSelectedLabel: (article, name) => {
    if (!article) return;
    const selected = article[name];
    if (!selected) return;
    return selected.title;
  },

  editAutocompleteGetSelectedId: (article, name) => {
    if (!article) return;
    const selected = article[name];
    if (!selected) return;
    return selected.id;
  },

  shouldShowBooleanValue: (article, name) => {
    if (article[name] === false || article[name] === true) {
      return true;
    } else {
      return false;
    }
  },

  getBooleanStringValue: (article, name, context) => {
    if (article[name] === false) {
      return i18n("no", context);
    } else if (article[name] === true) {
      return i18n("yes", context);
    }
  },

  getSelectedBooleanKey: (article, name) => {
    if (article[name] === false) {
      return "no";
    } else if (article[name] === true) {
      return "yes";
    } else {
      return null;
    }
  },

  getvalue: (article, name, locale = "en") => {
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
    if (!article) {
      return "undefined " + name;
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

  getOptions: (article, name) => {
    return article[name];
  },

  getSearchFilterTitle: (key, context) => {
    return i18n(`filter-for-${key}`, context);
  },

  getLinkSetValue(article, name, index, attr) {
    if (!article[name]) return;
    if (!article[name][index]) return;

    if (attr === "source_url") {
      return article[name][index][attr].trim().includes("base64")
        ? ""
        : article[name][index][attr];
    }
    return article[name][index][attr];
  },

  linkSetFieldName(name, index, attr) {
    return `${name}[${index}][${attr}]`;
  },

  moment(date, format) {
    return moment(date).format(format);
  },

  formatDate(date, format, context) {
    setMomentLocale(context);
    return moment(date).format(format);
  },

  formatArticleDate(article, name, format, context) {
    setMomentLocale(context);
    if (article[name] && article[name] !== "") {
      return moment(article[name]).format(format);
    }
  },

  formatCurrentDate(format, context) {
    setMomentLocale(context);
    return moment(Date.now()).format(format);
  },

  getCaseEditSubmitType(req) {
    if (req.query.full === "1") {
      return "full";
    } else {
      return "quick";
    }
  },

  shareLink(type, article, req) {
    const twitterCharacterMax = 240 - 17; // minus 17 characters to account for @participedia and ellipsis
    const url = currentUrl(req, article.id);
    const title = () => {
      const articleTitle = article.title;
      if (articleTitle.length >= twitterCharacterMax) {
        return articleTitle.substring(0, twitterCharacterMax) + "...";
      } else {
        return articleTitle;
      }
    };
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter:
        `https://twitter.com/intent/tweet?` +
        `text=${encodeURIComponent(title())} @participedia&url=${url}`,
      linkedIn:
        `https://www.linkedin.com/shareArticle?mini=true` +
        `&url=${url}&title=${article.title}`,
      instagram: `https://instagram.com/participedia`,
    };
    return shareUrls[type];
  },

  hasPhoto(article) {
    return article.photos && article.photos.length > 0;
  },

  hasCaptionText(photo) {
    return (
      photo.title ||
      (photo.source_url
        ? photo.source_url.trim().includes("base64")
          ? ""
          : photo.source_url
        : "") ||
      photo.attribution ||
      ""
    );
  },

  getFirstLargeImageForArticle(article) {
    return getFirstLargeImageForArticle(article);
  },

  isReaderPage(params) {
    return params && params.view && params.view === "view";
  },

  getPageTitle(req, article, context) {
    return getPageTitle(req, article, context);
  },

  socialTagsTemplate(article, req, context) {
    const defaultPhotoUrl = `https://${req.headers.host}/images/participedia-social-img.jpg`;
    const url = currentUrl(req);
    // replace double quotes in title and description with single quotes
    let title = getPageTitle(req, article, context).replace(/"/g, "'");
    let description =
      (article && article.description) || i18n("main_tagline", context);
    description = description.replace(/"/g, "'");
    const imageUrl =
      (article && getFirstLargeImageForArticle(article)) || defaultPhotoUrl;
    return socialTagsTemplate(title, description, url, imageUrl);
  },

  articleDataTitle(article) {
    return toTitleCase(article.type + " Data");
  },

  sortedEditHistory(article) {
    let editHistory = article.edit_history;
    const isSameDate = (list, timestamp) => {
      return list.find(entry =>
        moment(entry.timestamp).isSame(timestamp, "day")
      );
    };

    // Filter and sort edit history to show one edit per user, per day
    // in the order of most recent edits first.
    // (do not show multiple edits by the same author on the same day)

    if (!Array.isArray(editHistory)) {
      editHistory = [];
    }

    let editsByUser = {};
    editHistory.forEach(edit => {
      if (
        editsByUser[edit.user_id] &&
        !isSameDate(editsByUser[edit.user_id], edit.timestamp)
      ) {
        // only add this edit if we don't already have an edit entry for this user on this day
        editsByUser[edit.user_id] = editsByUser[edit.user_id].concat([edit]);
      } else if (!editsByUser[edit.user_id]) {
        editsByUser[edit.user_id] = [edit];
      }
    });

    let editsToBeSorted = [];
    Object.keys(editsByUser).forEach(userId => {
      editsByUser[userId].forEach(
        entry => (editsToBeSorted = editsToBeSorted.concat([entry]))
      );
    });

    const history = editsToBeSorted.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const creator = article.creator;
    const postDate = article.post_date;
    const postDateIsInHistory = () => {
      const userIsIn = history.find(entry => entry.user_id === creator.user_id);
      const dateIsIn = isSameDate(history, postDate);
      return userIsIn && dateIsIn;
    };


    if (!postDateIsInHistory() && !article.orginal_entry_id) {
      history.push({
        user_id: creator ? creator.user_id : null,
        timestamp: postDate,
        name: creator ? creator.name : null,
      });
    }

    return history;
  },

  // search layout helpers
  cardLayoutType(req) {
    const defaultLayoutType = "grid";
    const type = req.query && req.query.layout;
    return type ? type : defaultLayoutType;
  },

  // pagination helpers
  paginationNumResults(cards, totalResults, req) {
    const pageNum = parseInt(req.query.page);

    let start = (pageNum - 1) * 20 + 1;
    let end = totalResults;

    if (20 < totalResults) {
      end = 20 * pageNum;
      if (end > totalResults) {
        end = totalResults;
      }
    }

    if (pageNum > 1) {
      return `${start} - ${end}`;
    } else {
      return "1 - " + cards.length;
    }
  },

  paginationCollections(req, context) {
    const keyLists = searchFilterKeyLists(typeFromReq(req));
    const filterKeys = searchFilterKeys(typeFromReq(req));
    const filterArr = keyLists.concat(filterKeys);

    const searchFilterKeyListMapped = filterArr
      .map(key => filterCollections(req, key, context))
      .filter(el => el);
    const arr = concactArr(searchFilterKeyListMapped);

    if (arr.length !== 0) {
      return ` ${arr}`;
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
    const currentPageNum = (req.query && parseInt(req.query.page)) || 1;
    if (currentPageNum !== parseInt(totalPages)) {
      return currentPageNum + 1;
    } else {
      return totalPages;
    }
  },

  getPaginationRange(total, req) {
    let length = 3;
    let current = 1;

    if (req.query && req.query.page) {
      current = req.query.page;
    }

    if (length > total) length = total;

    let start = current - Math.floor(length / 2);
    start = Math.max(start, 1);
    start = Math.min(start, 1 + total - length);

    let range = Array.from({ length: length }, (el, i) => {
      let page = start + i;
      return { page: page, isActive: page == current };
    });

    if (total > length) {
      let dots = { page: null, isActive: false };
      if (range[range.length - 1].page == total) {
        range.unshift({ page: 1, isActive: current == 1 }, dots);
      } else {
        range.push(dots, { page: total, isActive: total == current });
      }
    }

    return range;
  },

  getPaginationCategoryLabel(req, context) {
    const category = req.query.selectedCategory || undefined;
    let text;

    switch (category) {
      case "case": {
        text = "cases of";
        break;
      }
      case "organizations": {
        text = "organizations of";
        break;
      }
      case "method": {
        text = "methods of";
        break;
      }
      case "collections": {
        text = "collections of";
        break;
      }
      default: {
        text = "entries of";
        break;
      }
    }

    return i18n(text, context);
  },

  // tab helpers
  isTabActive(req, tabName) {
    const tabParam = req.query && req.query.selectedCategory;
    // this is kind of hacky -- this will break in the case that when
    // have a default tab with the same name as a non-default tab on another page.
    // tab-contributions is default tab on /user/{id} (user-view)
    // tab-all is default tab on /search
    const defaultTabs = ["contributions", "all", "review-new"];
    // if there is no param, make default tab active
    if (
      (!tabParam && defaultTabs.indexOf(tabName) > -1) ||
      tabParam === tabName
    ) {
      return "checked";
    }
  },

  isLocalNav(tabName) {
    const localTabs = ["en", "fr", "de", "es", "zh", "pt", "it"];
    return localTabs.includes(tabName) ? "local" : "server";
  },

  getHomeTabs(context) {
    return [
      { title: i18n("All", context), key: "all" },
      { title: i18n("Cases", context), key: "case" },
      { title: i18n("Methods", context), key: "method" },
      { title: i18n("Organizations", context), key: "organizations" },
      { title: i18n("Collections", context), key: "collections" },
    ];
  },

  getCollectionTabs(context) {
    return [
      { title: i18n("All", context), key: "all" },
      { title: i18n("Cases", context), key: "case" },
      { title: i18n("Methods", context), key: "method" },
      { title: i18n("Organizations", context), key: "organizations" },
    ];
  },

  getContentChooserTabs(context) {
    return [{ title: i18n("Drafts", context), key: "drafts" }];
  },

  getUserTabs(context) {
    // if it's the profile owner making the request, return contributions and bookmarks.
    // otherwise return contributions only
    const profile = context.data.root.profile;
    const user = context.data.root.req.user;
    const draftsTypes = ["cases", "methods", "organizations"];
    // merge all article types into 1 array
    let allDrafts = [];

    if (user) {
      draftsTypes.forEach(type => {
        if (user[type]) {
          allDrafts = allDrafts.concat(user[type].filter(x => !x.published));
        }
      });

      if (
        (user && user.id) === (profile && profile.id) &&
        allDrafts.length > 0
      ) {
        return [
          { title: i18n("Contributions", context), key: "contributions" },
          { title: i18n("Bookmarks", context), key: "bookmarks" },
          { title: i18n("Drafts", context), key: "drafts" },
        ];
      } else if ((user && user.id) === (profile && profile.id)) {
        return [
          { title: i18n("Contributions", context), key: "contributions" },
          { title: i18n("Bookmarks", context), key: "bookmarks" },
        ];
      } else{
        return [{ title: i18n("Contributions", context), key: "contributions" }];
      }
    } else {
      return [{ title: i18n("Contributions", context), key: "contributions" }];
    }
  },

  isSelectedUserTab(req, category) {
    const defaultTab = "contributions";
    if (req.query.selectedCategory) {
      return req.query.selectedCategory === category;
    } else if (category === defaultTab) {
      return true;
    }
  },

  isSelectedContentChooserTab(req, category) {
    const defaultTab = "drafts";
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

  isMapView(req, maps) {
    if (req.query.layout) {
      return req.query.layout === maps;
    } else {
      return false;
    }
  },

  // location helpers
  hasLocationData(article) {
    let hasLocationData = false;
    LOCATION_FIELD_NAMES.forEach(fieldName => {
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
    if(profile){
      contributionTypes.forEach(type => {
        allContributions = allContributions.concat(
          profile[type].filter(x => x.published)
        );
      });
    }
    return allContributions;
  },

  getDraftsForProfile(profile) {
    const draftsTypes = ["cases", "methods", "organizations"];
    // merge all article types into 1 array
    let allDrafts = [];
    if (profile) {
      draftsTypes.forEach(type => {
        allDrafts = allDrafts.concat(profile[type].filter(x => !x.published));
      });
      allDrafts.sort(
        (a, b) => Date.parse(b.updated_date) - Date.parse(a.updated_date)
      );
    }

    return allDrafts;
  },

  isNotLoggedIn(req) {
    const user = req.user;
    if (!user) {
      return true;
    } else {
      return false;
    }
  },

  // utilities
  currentUrl(req) {
    return currentUrl(req);
  },

  isNewView(req) {
    const baseUrls = ["/case", "/method", "/organization", "/collection"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("new") === 1;
  },

  isTranslatable(article, name, context) {
    return ["title", "description", "body"].includes(name);
  },

  isEditView(req) {
    const baseUrls = [
      "/case",
      "/method",
      "/organization",
      "/user",
      "/collection",
    ];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("edit") >= 0;
  },

  isReviewView(req) {
    const baseUrls = ["/entries"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("review") >= 0;
  },

  isExportCSVView(req) {
    const baseUrls = ["/exports"];
    return baseUrls.includes(req.baseUrl) && req.path.indexOf("csv") >= 0;
  },

  getFormDataType(article) {
    return !article.published ? "draft" : "";
  },

  isReaderView(req) {
    const baseUrls = ["/case", "/method", "/organization"];
    return (
      baseUrls.includes(req.baseUrl) &&
      req.path.indexOf("edit") === -1 &&
      req.path.indexOf("new") !== 1
    );
  },

  isHomeView(req) {
    return req.path === "/" && req.baseUrl !== "/search";
  },

  isSearchView(req) {
    return req.baseUrl === "/search";
  },

  isCollectionView(req) {
    return req.baseUrl === "/collection";
  },

  isNotCollectionView(req) {
    return req.baseUrl !== "/collection";
  },

  isNotPublished(req) {
    return !req.published;
  },

  isPublished(req) {
    return req.published;
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

  jsCacheVersion(filepath) {
    // return last modified datetime in ms for filepath
    const stats = fs.statSync(`public${filepath}`);
    return stats.mtimeMs;
  },

  isDandTSection(sectionKey) {
    return sectionKey === "about.committees.design_tech.p1";
  },

  // data
  getPartnersData() {
    return aboutData.partners;
  },

  getTeamMemberData() {
    return PARTNER_TEAM;
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

  // search filters
  searchFiltersSections(type) {
    return searchFiltersList[type];
  },

  searchFiltersDisplay(req) {
    // Check if selected category params exist
    if (!req.query.hasOwnProperty("selectedCategory")) {
      return [];
    }

    // Check if selected category value exist in record
    var selectedCategory = req.query["selectedCategory"];
    if (!searchFiltersList.hasOwnProperty(selectedCategory)) {
      return [];
    }

    var filters = [];
    var filterCategoryItems = searchFiltersList[selectedCategory];
    var query = req.query;

    for (const property in query) {
      if (property !== "selectedCategory") {
        // Get category name
        var filterObject = {};
        for (i = 0; i < filterCategoryItems.length; i++) {
          if (filterCategoryItems[i]["fieldNameKeys"].includes(property)) {
            // filterObject['label'] = filterCategoryItems[i]['sectionLabel'];
            filterObject["labelMetaData"] = filterCategoryItems[i];

            var queryValue = query[property];
            var value = queryValue.split(",");
            filterObject["valueMetaData"] = {
              queryValue: value,
              queryLabel: property,
            };

            filters.push(filterObject);
            break;
          }
        }
      }
    }

    return filters;
  },

  searchFiltersDisplayItems(metaData, name, context) {
    var newData = [];

    metaData.forEach(data => {
      var newValue;
      if (name === "country") {
        newValue = {
          key: data,
          value: data,
          section: name,
        };
      } else {
        // name:general_issues-key:arts
        var key = data;
        newValue = {
          key: key,
          value: i18n(`name:${name}-key:${key}`, context),
          section: name,
        };
      }
      newData.push(newValue);
    });
    return newData;
  },

  getCountryFilterKey(context) {
    return countries.map(item => {
      return {
        key: item.value,
        value: i18n(item.value, context),
      };
    });
  },

  getOptionsForFilterKey(name, isInitialDisplay, context) {
    if (name !== "country" && name !== "verified") {
      let items = sharedFieldOptions[name].map(key => {
        return {
          key: key,
          value: i18n(`name:${name}-key:${key}`, context),
        };
      });

      if (isInitialDisplay) {
        return items.slice(0, 4);
      }
      return items.slice(4);
    }
  },

  isNotCollection: article => {
    return article.type !== "collection";
  },

  collectionHasLink: collection => {
    return collection.links & (collection.links.length > 0);
  },

  getCollectionSummaryString: (collection, numArticlesByType, context) => {
    const __ = context.data.root.__;

    const numStringForType = type => {
      const numOfThing = numArticlesByType[type];
      if (numOfThing === 0 || numOfThing > 1) {
        return __(`collection_num_${type}_plural_or_zero`, `${numOfThing}`);
      } else {
        return __(`collection_num_${type}`, `${numOfThing}`);
      }
    };
    const numCasesString = numStringForType("case");
    const numMethodsString = numStringForType("method");
    const numOrgsString = numStringForType("organization");
    return (
      __("collection_summary_string", `${collection.title}`) +
      " " +
      numCasesString +
      ", " +
      numMethodsString +
      ", " +
      numOrgsString +
      "."
    );
  },

  // banner-notice helpers
  getBannerText(withLink, context) {
    const __ = context.data.root.__;
    if (withLink === "withLink") {
      return __(
        "citizens_voices_collection_is_now_live",
        "<a href='/collection/6501'>",
        "</a>"
      );
    } else {
      return __(
        "citizens_voices_collection_is_now_live",
        "<strong>",
        "</strong>"
      );
    }
  },

  getSelectedCategory(req) {
    return req.query.selectedCategory || null;
  },

  getSelectedCategoryLabel(req, total) {
    let text;
    if (total <= 1){
      // return req.query.selectedCategory || null;
      switch (req.query.selectedCategory) {
        case "case": {
          text = "case";
          break;
        }
        case "organizations": {
          text = "organization";
          break;
        }
        case "method": {
          text = "method";
          break;
        }
        case "collections": {
          text = "collection";
          break;
        }
        default: {
          text = "entry";
          break;
        }
      }

      return text; 
    } else {
      switch (req.query.selectedCategory) {
        case "case": {
          text = "cases";
          break;
        }
        case "organizations": {
          text = "organizations";
          break;
        }
        case "method": {
          text = "methods";
          break;
        }
        case "collections": {
          text = "collections";
          break;
        }
        default: {
          text = "entries";
          break;
        }
      }

      return text;
    }
  },


  // Helper to identify if filter key will display as checkbox;
  isSearchFilterCheckboxSelection(key) {
    const excludedFilterKeys = ["country", "verified"];

    if (excludedFilterKeys.indexOf(key) >= 0) {
      return false;
    }

    return true;
  },

  showCountryAutoComplete(category) {
    const allowedCategories = ["case", "organizations"];
    if (allowedCategories.indexOf(category) >= 0) return true;
    return false;
  },

  showCsvButton(req) {
    if (["/search", "/collection", "/new"].indexOf(req.baseUrl) >= 0) {
      return req.query.selectedCategory != "collections";
    }
    return false;
  },

  isNotMapView(req, tabName) {
    const tabParam = req.query && req.query.layout;
    if (
      (tabName === "collections" || tabName === "method") &&
      tabParam === "maps"
    ) {
      return false;
    } else {
      return true;
    }
  },

  checkMapsAvail(req) {
    const tabParam = req.query && req.query.selectedCategory;
    if (
      tabParam === "collections" || tabParam === "method" || req.baseUrl === '/user' || req.baseUrl === '/entries'
    ) {
      return false;
    } else {
      return true;
    }
  },

  hideGridToggle(req) {
    const tabParam = req.query && req.query.view;
    if (["/case", "/method", "/organization"].includes(req.baseUrl)) {
      return false;
    } else if (tabParam === "maps"){
      return false;
    }
    return true;
  },

  includeSearchFilters(req) {
    // do not show search filters on new case, organization, method and collection as well as on collection and user pages
    return req.baseUrl.indexOf("collection") > 0 ||
      req.baseUrl.indexOf("user") > 0 ||
      ["/case", "/method", "/organization", "/entries"].includes(req.baseUrl)
      ? false
      : true;
  },

  withItem(object, options) {
    return options.fn(object[options.hash.key]);
  },

  eachIncludeParent(context, options) {
    var fn = options.fn,
      inverse = options.inverse,
      ret = "",
      _context = [];
    $.each(context, function(index, object) {
      var _object = $.extend({}, object);
      _context.push(_object);
    });
    if (_context && _context.length > 0) {
      for (var i = 0, j = _context.length; i < j; i++) {
        _context[i]["parentContext"] = options.hash.parent;
        ret = ret + fn(_context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  },

  convertHtmlToText(article, name) {
    if(article && name && article[name] && typeof article[name] === 'string'){
      let text = article[name] || "";
      text = text.replace(/<[^>]+>/g, '');
      return text.length > 40 ? `${text.slice(0, 40)}...` : text;
    } else {
      return '';
    } 
  },

  hideFormatButton(req) {
    if (req.baseUrl === '/user'
    ) {
      return false;
    } else {
      return true;
    }
  },

  checkAndGetValue(val){
    if(val){
      return val;
    }
    return '__'
  },

  getEntriesReviewTabs(context) {
    return [
      { title: i18n("New Entries", context), key: "review-new" },
      { title: i18n("Edits", context), key: "review-edits" },
    ];
  },

  isSelectedEntriesReviewTab(req, category) {
    const defaultTab = "review-new";
    if (req.query.selectedCategory) {
      return req.query.selectedCategory === category;
    } else if (category === defaultTab) {
      return true;
    }
  },

  checkeEtries(req) {
    const tabParam = req.query && req.query.selectedCategory;
    if (req.baseUrl === '/entries') {
      return false;
    } else {
      return true;
    }
  },
};
