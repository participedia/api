// Get google translate credentials
const keysEnvVar = process.env['GOOGLE_TRANSLATE_CREDENTIALS'];
if (!keysEnvVar) {
  throw new Error('The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!');
  return;
}
const { Translate } = require('@google-cloud/translate').v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys['key'] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

let { remove } = require("lodash");
const cache = require("apicache");
const equals = require("deep-equal");
const moment = require("moment");
const { SUPPORTED_LANGUAGES, RESPONSE_LIMIT } = require("./../../constants.js");
const logError = require("./log-error.js");
const createCSVDataDump = require("./create-csv-data-dump.js");

const {
  as,
  db,
  pgp,
  INSERT_LOCALIZED_TEXT,
  UPDATE_NOUN,
  INSERT_AUTHOR,
  CASE_BY_ID,
  METHOD_BY_ID,
  ORGANIZATION_BY_ID,
  COLLECTION_BY_ID,
  COLLECTIONS,
  FEATURED
} = require("./db");

// Define the keys we're testing (move these to helper/things.js ?
const titleKeys = ["id", "title"];
const shortKeys = titleKeys.concat([
  "type",
  "photos",
  "post_date",
  "updated_date",
  "bookmarked",
]);
const mediumKeys = shortKeys.concat(["body", "location"]);

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

function getLanguage(req) {
  // once we have translations for user generated content in all supported languages,
  // we can use the locale cookie to query by language.
  return req.cookies.locale || "en";
}

function encodeURL(url) {
  if (url.startsWith("http")) {
    return url;
  } else {
    return process.env.AWS_UPLOADS_URL + fixedEncodeURIComponent(url);
  }
}

const fixUpURLs = function(article) {
  // FIXME: need to handle all media objects and source_urls for sourced media
  if (article.photos && article.photos.length) {
    article.photos.forEach(obj => {
      obj.url = encodeURL(obj.url);
    });
  }

  if (article.files && article.files.length) {
    article.files.forEach(obj => {
      obj.url = encodeURL(obj.url);
    });
  }
};

const placeHolderPhotos = article => {
  if (article.photos || article.photos.length <= 0) {
    article.photos.push({
      url: "/images/texture_1.svg",
    });
    return article.photos;
  }
};

const returnByType = async (res, params, article, static, user, results = {}, total = null, pages = null, numArticlesByType = null) => {
  const { returns, type, view, articleid} = params;
  const articles = {};

  if (!article) return;

  // if article is hidden and user is not admin, return 404
  if(Array.isArray(article)) {
    if (article[0] && article[0].hidden && (!user || (user && !user.isadmin))|| article.length === 0) {
      return res.status(404).render("404");
    }
    article.forEach(e => {
      articles[e.language] = e;
    });
    article = articles;
  } else {
    if (article.hidden && (!user || (user && !user.isadmin))) {
      return res.status(404).render("404");
    }
    if(!articleid) {
      // A new article
      SUPPORTED_LANGUAGES.forEach(lang => {
        articles[lang.twoLetterCode] = article;
      });
      article = articles;
    }
  }

  switch (returns) {
    case "htmlfrag":
      return res.status(200).render(type + "-" + view, {
        article,
        static,
        user,
        params,
        layout: false,
      });
    case "json":
      return res.status(200).json({ OK: true, article, results, total, pages, numArticlesByType });
    case "csv":
      // TODO: implement CSV
      let category = params.selectedCategory == "organizations" ? "organization" : params.selectedCategory;
      if(params.type === "collection" && supportedTypes.indexOf(category) >= 0) {
        let file = await createCSVDataDump(category, results);
        return res.download(file);
      }
      return res.status(500, "CSV not implemented yet").render();
    case "xml":
      // TODO: implement XML
      return res.status(500, "XML not implemented yet").render();
    case "html": // fall through
    default:
      return res
        .status(200)
        .render(type + "-" + view, { article, results, static, user, params, total, pages, numArticlesByType });
  }
};

const parseGetParams = function(req, type) {
  return Object.assign({}, req.query, {
    type,
    view: as.value(req.params.view || "view"),
    articleid: as.integer(req.params.thingid || req.params.articleid),
    lang: as.value(getLanguage(req)),
    userid: req.user ? as.integer(req.user.id) : null,
    returns: as.value(req.query.returns || "html"),
  });
};

/* I can't believe basic set operations are not part of ES5 Sets */
Set.prototype.difference = function(setB) {
  var difference = new Set(this);
  for (var elem of setB) {
    difference.delete(elem);
  }
  return difference;
};

const supportedTypes = ["case", "method", "organization"];

/** uniq ::: return a list with no repeated items. Items will be in the order they first appear in the list. **/
const uniq = list => {
  let newList = [];
  list.forEach(item => {
    if (!newList.includes(item)) {
      newList.push(item);
    }
  });
  return newList;
};

const limitFromReq = req => {
  let limit = parseInt(req.query.limit || RESPONSE_LIMIT);
  const resultType = (req.query.resultType || "").toLowerCase();
  const returns = (req.query.returns || "").toLowerCase();
  if (resultType === "map") {
    limit = 0; // return all
  } else if(returns === "csv") {
    limit = 0;
  }
  return limit;
};

const offsetFromReq = req => {
  let query = req.query.page ? req.query.page.replace(/[^0-9]/g, "") : "";
  const page = Math.max(as.number(query || 1), 1);
  return (page - 1) * limitFromReq(req);
};

let queries = {
  case: CASE_BY_ID,
  method: METHOD_BY_ID,
  organization: ORGANIZATION_BY_ID,
  collection: COLLECTION_BY_ID
};

async function maybeUpdateUserText(req, res, type) {
  // keyFieldsToObjects is a temporary workaround while we move from {key, value} objects to keys
  // if none of the user-submitted text fields have changed, don't add a record
  // to localized_text or
  const newArticle = req.body;
  const params = parseGetParams(req, type);
  const oldArticle = (await db.one(queries[type], params)).results;
  if (!oldArticle) {
    throw new Error("No %s found for id %s", type, params.articleid);
  }
  fixUpURLs(oldArticle);
  let textModified = false;
  const updatedText = {
    body: oldArticle.body,
    title: oldArticle.title,
    description: oldArticle.description,
    language: params.lang,
    type: type,
    id: params.articleid,
  };
  ["body", "title", "description"].forEach(key => {
    let value;
    if (key === "body") {
      value =
        newArticle[key] !== undefined
          ? as.richtext(newArticle[key] || null)
          : oldArticle[key];
    } else {
      value =
        newArticle[key] !== undefined
          ? as.text(newArticle[key] || null)
          : oldArticle[key];
    }

    if (newArticle[key] || oldArticle[key] !== newArticle[key]) {
      textModified = true;
    }
    updatedText[key] = value;
  });
  const author = {
    user_id: params.userid,
    timestamp: "now",
    thingid: params.articleid,
  };

  if (newArticle.updated_date) {
    if (typeof newArticle.updated_date === 'string') {
      // Means the value entered by the user.
      author['timestamp'] = moment(newArticle.updated_date, moment.ISO_8601).format();
    } else {
      // Means the value is set using Date.now();
      // And overwrite using moment().format();
      author['timestamp'] = moment().format();
    }
  }

  if (textModified) {
    return { updatedText, author, oldArticle };
  } else {
    return { updatedText: null, author, oldArticle };
  }
}

function setConditional(
  updatedObject,
  newObject,
  errorReporter,
  updateFunction,
  key
) {
  if (newObject[key] === undefined) {
    // if we're updating a partial, we still need to rewrite the updated object
    // from front-end format to save format
    updatedObject[key] = errorReporter.try(updateFunction)(
      updatedObject[key],
      key
    );
  } else {
    updatedObject[key] = errorReporter.try(updateFunction)(newObject[key], key);
  }
}

async function getCollections(lang) {
  const results = await db.any(COLLECTIONS, {
    language: lang
  });
  return results;
}

//get searchFilterKeyList and searchFilterKeys by methods,cases, orgs

const searchFilterKeys = type => {
  if (type === "case") {
    return [
      "country",
      "scope_of_influence",
      "public_spectrum",
      "open_limited",
      "recruitment_method",
      "facetoface_online_or_both",
    ];
  } else if (type === "method") {
    return [
      "open_limited",
      "recruitment_method",
      "facetoface_online_or_both",
      "public_spectrum",
      "level_polarization",
      "level_complexity",
      "facilitators",
    ];
  } else if (type === "organization") {
    return ["country", "sector"];
  } else {
    return [];
  }
};

const searchFilterKeyLists = type => {
  if (type === "case") {
    return [
      "general_issues",
      "purposes",
      "approaches",
      "method_types",
      "tools_techniques_types",
      "organizer_types",
      "funder_types",
      "change_types",
      "completeness",
      "collections",
    ];
  } else if (type === "method") {
    return [
      "method_types",
      "number_of_participants",
      "participants_interactions",
      "decision_methods",
      "scope_of_influence",
      "purpose_method",
      "completeness",
      "collections",
    ];
  } else if (type === "organization") {
    return [
      "general_issues",
      "type_method",
      "level_polarization",
      "scope_of_influence",
      "type_tool",
      "completeness",
      "collections",
    ];
  } else {
    return [];
  }
};

//check if url is valid, if http or https is not detected append http
const verifyOrUpdateUrl = links => {
  let arr = links.map(link => {
    if (!/\b(http|https)/.test(link.url)) {
      if (link.url.length > 0) {
        link.url = `http://${link.url}`;
      }
    }
    return link;
  });
  return arr;
};

const validateUrl = links => {
  if (links) {
    let arr = links.map(item =>
      item.url.length > 0 ? isValidURL(item.url) : true
    );
    return !arr.includes(false);
  }
};

const isValidURL = string => {
  if (typeof string !== 'string') {
    return false;
  }

  let res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
};

const isValidDate = date => {
  return moment(date).isValid();
};

const validateFields = (entry, entryName) => {
  let links = entry.links;
  const title = entry.title;
  const startDate = entry.start_date;
  const endDate = entry.end_date;
  let errors = [];

  // validate title
  if (!title) {
    errors.push(`Cannot create a ${entryName} without at least a title.`);
  }

  // validate url
  if (links) {
    let linkErrors = 0;
    for (let key in links) {
      let url = links[key].url;
      if (url.length > 0) {
        links = verifyOrUpdateUrl(links);
        const isUrlValid = validateUrl(links);
        if (!isUrlValid) {
          linkErrors++;
        }
      }
    }
    if (linkErrors > 0) {
      errors.push("Invalid link url.");
    }
  }

  // Validate duration
  if (startDate) {
    if (!isValidDate(startDate)) {
      errors.push("Invalid Start Date. Valid format is YYYY-MM-DD.");
    }
  }

  if (endDate) {
    if (!isValidDate(endDate)) {
      errors.push("Invalid End Date. Valid format is YYYY-MM-DD.");
    }
  }

  return errors;
};

const requireTranslation = (entry, entryName) => {
  let links = entry.links;
  const title = entry.title;
  const startDate = entry.start_date;
  const endDate = entry.end_date;
  let linkErrors = 0;
  let errors = [];

  // validate url
  if (links) {
    for (let key in links) {
      let url = links[key].url;
      if (url.length > 0) {
        links = verifyOrUpdateUrl(links);
        const isUrlValid = validateUrl(links);
        if (!isUrlValid) {
          linkErrors++;
        }
      }
    }
    if (linkErrors > 0) {
      errors.push("Invalid link url.");
    }
  }
  const requiresTranslation = !title;
  return requiresTranslation;
};

async function createLocalizedRecord(data, thingid, localesToTranslate = undefined) {
  let records = [];
  let languagesToTranslate = localesToTranslate || SUPPORTED_LANGUAGES || [];
  for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    const language = SUPPORTED_LANGUAGES[i];

    if (languagesToTranslate.includes(language.twoLetterCode) && language.twoLetterCode !== data.language) {
      const item = {
        body: '',
        title: '',
        description: '',
        language: language.twoLetterCode,
        thingid: thingid,
        timestamp: 'now'
      };

      if (data.body) {
        item.body = await translateText(data.body, language.twoLetterCode);
      }

      if (data.title) {
        item.title = await translateText(data.title, language.twoLetterCode);
      }

      if (data.description) {
        item.description = await translateText(data.description, language.twoLetterCode);
      }
      
      records.push(item);
    }
  }

  const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid', 'timestamp'], 'localized_texts');

  db.none(insert)
    .then(function(data) {
      console.log(data);
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function createUntranslatedLocalizedRecords(data, thingid) {
  let records = [];

  if(!Array.isArray(data)) return;
  const supportedTwoLetterCodes = SUPPORTED_LANGUAGES.map(lang => lang.twoLetterCode);

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if(supportedTwoLetterCodes.includes(entry.language)) {
      const item = {
        body: '',
        title: '',
        description: '',
        language: entry.language,
        thingid: thingid,
        timestamp: 'now'
      };

      if (entry.body) {
        item.body = entry.body;
      }

      if (entry.title) {
        item.title = entry.title;
      }

      if (entry.description) {
        item.description = entry.description;
      }
      
      records.push(item);
    }
  }
  const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid', 'timestamp'], 'localized_texts');

  db.none(insert)
  .then(function(data) {
    console.log(data);
  })
  .catch(function(error) {
    console.log(error);
  });
}

async function translateText(data, targetLanguage) {
  // The text to translate
  let allTranslation = '';

  // The target language
  const target = targetLanguage;
  let length = data.length;
  if (length > 5000) {
    // Get text chunks
    let textParts = data.match(/.{1,5000}/g);
    for(let text of textParts){
      let [translation] = await translate
        .translate(text, target)
        .catch(function(error) {
          logError(error);
        });
      allTranslation += translation;
    }
  } else {
    [allTranslation] = await translate
    .translate(data, target)
    .catch(function(error) {
      logError(error);
    });
  }
  return allTranslation;
}

module.exports = {
  supportedTypes,
  titleKeys,
  shortKeys,
  mediumKeys,
  uniq,
  fixUpURLs,
  validateUrl,
  isValidDate,
  verifyOrUpdateUrl,
  parseGetParams,
  returnByType,
  setConditional,
  maybeUpdateUserText,
  searchFilterKeys,
  searchFilterKeyLists,
  placeHolderPhotos,
  createLocalizedRecord,
  createUntranslatedLocalizedRecords,
  getCollections,
  validateFields,
  requireTranslation,
  limitFromReq,
  offsetFromReq
};
