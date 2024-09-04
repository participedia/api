// Get google translate credentials
const keysEnvVar = process.env["GOOGLE_TRANSLATE_CREDENTIALS"];
if (!keysEnvVar) {
  throw new Error(
    "The GOOGLE_TRANSLATE_CREDENTIALS environment variable was not found!"
  );
  return;
}
const selectedCategoryValues = [
  "all",
  "case",
  "method",
  "organization",
  "collection",
];

const { Translate } = require("@google-cloud/translate").v2;
const authKeys = JSON.parse(keysEnvVar);
authKeys["key"] = process.env.GOOGLE_API_KEY;
const translate = new Translate(authKeys);

let { remove } = require("lodash");
const cache = require("apicache");
const equals = require("deep-equal");
const moment = require("moment");
const { SUPPORTED_LANGUAGES, RESPONSE_LIMIT } = require("./../../constants.js");
const logError = require("./log-error.js");
const {createCSVDataDump} = require("./create-csv-data-dump.js");
const { getOriginalLanguageEntry } = require("../controllers/api/api-helpers");

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
  FEATURED,
  LOCALIZED_TEXT_BY_THINGID_ORDERBY,
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
  if(article.photos){
    if (article.photos.length <= 0) {
      article.photos.push({
        url: "/images/texture_1.svg",
      });
      return article.photos;
    }
  }
};

async function validateCaptcha(url) {
  let captchaValidationResult = false;
  let res = await fetch(url, {
    method: "post",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Accept: "application/json",
    },
  })
    .then(response => response.json())
    .then(google_response => {
      if (google_response.success == true) {
        captchaValidationResult = true;
      }
    })
    .catch(error => {
      console.log(error);
    });
  return captchaValidationResult;
}

const returnByType = async (
  res,
  params,
  article,
  static,
  user,
  results = {},
  total = null,
  pages = null,
  numArticlesByType = null
) => {
  const { returns, type, view, articleid } = params;
  const articles = {};
  const currentLocale = res.locale || "en";

  if (!article) return;

  // if article is hidden and user is not admin, return 404
  if (Array.isArray(article)) {
    if (
      (article[0] && article[0].hidden && (!user || (user && !user.isadmin))) ||
      article.length === 0
    ) {
      return res.status(404).render("404");
    }
    article.forEach(e => {
      articles[e.language] = e;
    });
    article = articles[currentLocale];

    // If current locale has no data structure. Then generate from the template;
    if (!article) {
      article = getStructure(type, articleid);
      articles[currentLocale] = article;
    }
  } else {
    if (article.hidden && (!user || (user && !user.isadmin))) {
      if (article.published) {
        return res.status(404).render("waiting-for-approval");
      } else {
        return res.status(404).render("404");
      }
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
      return res
        .status(200)
        .json({ OK: true, article, results, total, pages, numArticlesByType });
    case "csv":
      // TODO: implement CSV
      let category =
        params.selectedCategory == "organizations"
          ? "organization"
          : params.selectedCategory;
      if (
        params.type === "collection" &&
        supportedTypes.indexOf(category) >= 0
      ) {
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
        .render(type + "-" + view, {
          articles,
          article,
          results,
          static,
          user,
          params,
          total,
          pages,
          numArticlesByType,
        });
  }
};

const getStructure = (type, id) => {
  const structure = require(`${require.main.path}/api/helpers/data/${type}-structure.json`);
  return { id, ...structure, ...{ articleId: id } };
};

const parseGetParams = function(req, type, isView = false) {
  return Object.assign({}, req.query, {
    type,
    view: as.value(req.params.view || "view"),
    articleid: isView ? (req.params.thingid || req.params.articleid) : as.integer(req.params.thingid || req.params.articleid),
    lang: as.value(getLanguage(req)),
    userid: req.user ? as.integer(req.user.id) : null,
    returns: as.value(req.query.returns || "html"),
    canEdit: as.boolean(req.query.canEdit || true)
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
  } else if (returns === "csv") {
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
  collection: COLLECTION_BY_ID,
};

async function maybeUpdateUserText(req, res, type) {
  // keyFieldsToObjects is a temporary workaround while we move from {key, value} objects to keys
  // if none of the user-submitted text fields have changed, don't add a record
  // to localized_text or
  return maybeUpdateUserTextLocaleEntry(req.body, req, res, type);
}

async function maybeUpdateUserTextLocaleEntry(body, req, res, type, reqParams = null) {
  // keyFieldsToObjects is a temporary workaround while we move from {key, value} objects to keys
  // if none of the user-submitted text fields have changed, don't add a record
  // to localized_text or
  const newArticle = body;
  let params = parseGetParams(req, type);
  if(reqParams){
    params = reqParams;
  }
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
    if (typeof newArticle.updated_date === "string") {
      // Means the value entered by the user.
      author["timestamp"] = moment(
        newArticle.updated_date,
        moment.ISO_8601
      ).format();
    } else {
      // Means the value is set using Date.now();
      // And overwrite using moment().format();
      author["timestamp"] = moment().format();
    }
  }

  //Remove the blobs from being translated, in the create and edit form
  if(updatedText && updatedText.body){
    updatedText.body = updatedText.body.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
  }
  if(updatedText && updatedText.description){
    updatedText.description = updatedText.description.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
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
    language: lang,
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
      "verified",
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
      "verified",
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
      "verified",
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

const searchFilterKeyFromReq = (req, name) => {
  let value = req.query[name];
  if (value) {
    if (name === "country") {
      return ` AND ${name} = ANY ('{${value}}') `;
    } else {
      const values = value.split(",");
      let partial = values.length ? " AND " : "";
      partial += values[0] ? ` ${name}='${values[0]}'` : "";
      for (let i = 1; i < values.length; i++) {
        const element = values[i];
        partial += ` OR ${name}='${element}' `;
      }
      return partial;
    }
  }
};

var isFirstFilter = true;
const searchFilterKeyListFromReq = (req, name, index, type) => {
  let value = req.query[name];
  var prefix = type === "api" ? (isFirstFilter ? "WHERE " : " AND") : " AND";
  if (!value) {
    return ``;
  }
  isFirstFilter = false;
  if (name === "completeness") {
    return `${prefix} ${name} = ANY ('{${value}}') `;
  } else if (name === "verified") {
    return `${prefix} ${name} = ${value} `;
  } else {
    value = as.array(value.split(","));
    return `${prefix} ${name} && ${value} `;
  }
};

const searchFiltersFromReq = (req, type) => {
  isFirstFilter = true;
  const keys = searchFilterKeys(typeFromReq(req));
  const keyLists = searchFilterKeyLists(typeFromReq(req));

  let searchFilterKeysMapped = keys.map(key =>
    searchFilterKeyFromReq(req, key)
  );
  let searchFilterKeyListMapped = keyLists.map((key, index) =>
    searchFilterKeyListFromReq(req, key, index, type)
  );
  return searchFilterKeysMapped.join("") + searchFilterKeyListMapped.join("");
};

// strip off final character (assumed to be "s")
const singularLowerCase = name =>
  (name.slice(-1) === "s" ? name.slice(0, -1) : name).toLowerCase();

// just get the type, if specified
const typeFromReq = req => {
  var cat = singularLowerCase(req.query.selectedCategory || "Alls");
  if (selectedCategoryValues.indexOf(cat) < 0) {
    cat = "all";
  }
  return cat === "all" ? "thing" : cat;
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
  if (typeof string !== "string") {
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
  // if (!title) {
  //   errors.push(`Cannot create a ${entryName} without at least a title.`);
  // }

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

async function createLocalizedRecord(
  data,
  thingid,
  localesToTranslate = undefined,
  entryLocales
) {
  let records = [];
  let languagesToTranslate = localesToTranslate || SUPPORTED_LANGUAGES || [];

  const getEntryData = (field, language) => {
    try {
      return entryLocales[field][language];
    } catch (error) {
      return "";
    }
  };

  for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    const language = SUPPORTED_LANGUAGES[i];

    if (
      languagesToTranslate.includes(language.twoLetterCode) &&
      language.twoLetterCode !== data.language
    ) {
      const item = {
        body: getEntryData("body", language.twoLetterCode),
        title: getEntryData("title", language.twoLetterCode),
        description: getEntryData("description", language.twoLetterCode),
        language: language.twoLetterCode,
        thingid: thingid,
        // TODO: Admin check here
        timestamp: "now",
      };

      if (data.body && !item.body) {
        let body = data.body.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
        item.body = await translateText(body, language.twoLetterCode);
      }

      if (data.title && !item.title) {
        item.title = await translateText(data.title, language.twoLetterCode);
      }

      if (data.description && !item.description) {
        const description = data.description.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
        item.description = await translateText(description, language.twoLetterCode);
      }

      records.push(item);
    }
  }

  const insert = pgp.helpers.insert(
    records,
    ["body", "title", "description", "language", "thingid", "timestamp"],
    "localized_texts"
  );

  db.none(insert)
    .then(function(data) {
      console.log(data);
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function createUntranslatedLocalizedRecords(data, thingid, mainEntry) {
  let records = [];

  if (!Array.isArray(data)) return;
  const supportedTwoLetterCodes = SUPPORTED_LANGUAGES.map(
    lang => lang.twoLetterCode
  );

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (supportedTwoLetterCodes.includes(entry.language)) {
      const item = {
        body: entry.body || "",
        title: entry.title || "",
        description: entry.description || "",
        language: entry.language,
        thingid: thingid,
        // TODO: Admin check here
        timestamp: "now",
      };

      if (mainEntry) {
        if (!entry.title && mainEntry.title) {
          item.title = await translateText(mainEntry.title, entry.language);
        }

        if (!entry.body && mainEntry.body) {
          const body = mainEntry.body.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
          item.body = await translateText(body, entry.language);
        }

        if (!entry.description && mainEntry.description) {
          const description = mainEntry.description.replace(/<img src="data:image\/[a-z]+;base64[^>]*>/g,'');
          item.description = await translateText(description, entry.language);
        }
      }

      records.push(item);
    }
  }
  const insert = pgp.helpers.insert(
    records,
    ["body", "title", "description", "language", "thingid", "timestamp"],
    "localized_texts"
  );

  db.none(insert)
    .then(function(data) {
      console.log(data);
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function translateText(data, targetLanguage) {
  try {
    // The text to translate
    let allTranslation = "";
  
    // The target language
    const target = targetLanguage;
    let length = data.length;
    if (length > 5000) {
      // Get text chunks
      let textParts = data.match(/.{1,5000}/g);
      for (let text of textParts) {
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
  } catch (error) {
    console.log('translateText error ', error);
    throw error;
  }
}

function generateLocaleArticle(article, uniqueTranslateData, isEdit = false) {
  const articles = {};

  if (!isEdit) {
    SUPPORTED_LANGUAGES.forEach(language => {
      const translatedData = { ...article };
      if (translatedData) {
        articles[language.twoLetterCode] = {
          ...article[language.twoLetterCode],
          body: uniqueTranslateData.body[language.twoLetterCode] || null,
          title: uniqueTranslateData.title[language.twoLetterCode] || null,
          description:
            uniqueTranslateData.description[language.twoLetterCode] || null,
          language: language.twoLetterCode,
        };
      }
    });
  } else {
    SUPPORTED_LANGUAGES.forEach(language => {
      const translatedData = { ...article[language.twoLetterCode] };
      if (translatedData) {
        articles[language.twoLetterCode] = {
          ...article[language.twoLetterCode],
          body: uniqueTranslateData.body[language.twoLetterCode] || null,
          title: uniqueTranslateData.title[language.twoLetterCode] || null,
          description:
            uniqueTranslateData.description[language.twoLetterCode] || null,
          language: language.twoLetterCode,
        };
      }
    });
  }

  return articles;
}

function parseAndValidateThingPostData(body, entryName) {
  const langErrors = [];
  const localesToTranslate = [];
  const localesToNotTranslate = [];
  const entryPlaceholder = Object.values(body).filter(
    x => x.original_language
  )[0];
  const originalLanguageEntry = {
    ...entryPlaceholder,
    ...body[entryPlaceholder.original_language],
  };

  // Get locales to translate
  for (const entryLocale in body) {
    if (body.hasOwnProperty(entryLocale)) {
      const entry = body[entryLocale];
      if (!entry.title || requireTranslation(entry)) {
        localesToTranslate.push(entryLocale);
      }
    }
  }

  // Validate the rest
  for (const entryLocale in body) {
    if (
      body.hasOwnProperty(entryLocale) &&
      !localesToTranslate.includes(entryLocale)
    ) {
      const entry = body[entryLocale];
      const errors = validateFields(entry, entryName);
      langErrors.push({ locale: entryLocale, errors });
      localesToNotTranslate.push(entry);
    }
  }

  const originalEntryErrors = validateFields(originalLanguageEntry, entryName);
  langErrors.push({
    locale: originalLanguageEntry.original_language,
    errors: originalEntryErrors,
  });

  const hasErrors = !!langErrors.find(
    errorEntry => errorEntry.errors.length > 0
  );

  return {
    hasErrors,
    langErrors,
    localesToTranslate,
    localesToNotTranslate,
    originalLanguageEntry,
  };
}

async function getThingEdit(params, sqlFile, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRows = await (await db.any(sqlFile, params)).map(el =>
      el.row_to_json ? el.row_to_json : el.results
    );
    articleRows.forEach(article => fixUpURLs(article));
    return articleRows;
  } catch (error) {
    // only log actual excaptional results, not just data not found
    if (error.message !== "No data returned from the query.") {
      logError(error);
    }
    // if no entry is found, render the 404 page
    return null;
  }
}

/**
 *
 * @param {Object} req - Express HTTP request
 * @param {Object} res - Express HTTP response
 * @param {Function} entryUpdate -s Update Method of the entry from it's controller
 * @returns
 */
async function publishDraft(req, res, entryUpdate, entryType) {
  try {
    let {
      hasErrors,
      langErrors,
      localesToTranslate,
      localesToNotTranslate,
      originalLanguageEntry,
    } = parseAndValidateThingPostData(
      generateLocaleArticle(req.body, req.body.entryLocales),
      entryType
    );

    if (hasErrors) {
      return res.status(400).json({
        OK: false,
        errors: langErrors,
      });
    }
    let hidden = false;
    if (req.user.accepted_date === null || req.user.accepted_date === "") {
      hidden = true;
    }

    const title = originalLanguageEntry.title;
    const body =
      originalLanguageEntry.body || originalLanguageEntry.summary || "";
    const description = originalLanguageEntry.description || "";
    const original_language = originalLanguageEntry.original_language || "en";
    const { article, errors } = await entryUpdate(
      req,
      res,
      originalLanguageEntry
    );

    if (errors) {
      return res.status(400).json({
        OK: false,
        errors,
      });
    }

    if (hidden === false) {
      localesToNotTranslate = localesToNotTranslate.filter(
        el => el.language !== originalLanguageEntry.language
      );
      const localizedData = {
        body,
        description,
        language: original_language,
        title,
      };

      const filteredLocalesToTranslate = localesToTranslate.filter(
        locale =>
          !(
            locale === "entryLocales" ||
            locale === "originalEntry" ||
            locale === originalLanguageEntry.language
          )
      );
      if (filteredLocalesToTranslate.length) {
        await createLocalizedRecord(
          localizedData,
          article.id,
          filteredLocalesToTranslate,
          req.body.entryLocales
        );
      }
      if (localesToNotTranslate.length > 0) {
        await createUntranslatedLocalizedRecords(
          localesToNotTranslate,
          article.id,
          localizedData
        );
      }
    }
    res.status(200).json({
      OK: true,
      article,
    });
  } catch (error) {
    logError(error);
    res.status(400).json({ OK: false, error: error });
  }
}

/**
 *
 * @param {Object} req - Express HTTP request
 * @param {Object} res - Express HTTP response
 * @param {Object} args - Object and functions from it's controller
 * @returns
 */
async function saveDraft(req, res, args) {
  let {
    LOCALIZED_TEXT_BY_ID_LOCALE,
    UPDATE_DRAFT_LOCALIZED_TEXT,
    INSERT_LOCALIZED_TEXT,
    INSERT_AUTHOR,
    UPDATE_AUTHOR_FIRST,
    UPDATE_ENTRY,
    CREATE_ENTRY_QUERY,
    refreshSearch,
    thingId,
    getUpdatedEntry,
    getEntry,
    entryType,
  } = args;
  const params = parseGetParams(req, entryType);
  const user = req.user;
  const { articleid } = params;
  const originalLanguageEntry = getOriginalLanguageEntry(req.body);
  let entryData = "";
  if(req.body[originalLanguageEntry] !== undefined && req.body[originalLanguageEntry] !== null){
    entryData = req.body[originalLanguageEntry];
  } else {
    entryData = req.body;
  }
  let hidden = false;

  // Save draft
  if (!thingId && !articleid) {
    const thing = await db.one(CREATE_ENTRY_QUERY, {
      title: entryData.title || "",
      body: entryData.body || "",
      description: entryData.description || "",
      original_language: req.body.entryLocales.originalLanguage || "en",
      hidden,
    });

    thingId = thing.thingid;
  }

  req.params.thingid = thingId ?? articleid;
  params.articleid = req.params.thingid;
  const newEntry = entryData;

  const {
    updatedText,
    author,
    oldArticle,
  } = await maybeUpdateUserTextLocaleEntry(newEntry, req, res, entryType);
  const [updatedEntry, er] = getUpdatedEntry(
    user,
    params,
    newEntry,
    oldArticle
  );

  if(req.body.entryLocales !== undefined && req.body.entryLocales !== null){
    const localeEntries = generateLocaleArticle(
      req.body,
      req.body.entryLocales,
      true
    );

    for (const entryLocale in localeEntries) {
      if (req.body.hasOwnProperty(entryLocale)) {
        const entry = localeEntries[entryLocale];
        const localizedData = {
          title: entry.title ?? "",
          description: entry.description,
          body: entry.body,
          id: params.articleid,
          language: entryLocale,
        };

        let hasLocaleData = await db.any(LOCALIZED_TEXT_BY_ID_LOCALE, {
          language: entryLocale,
          thingid: params.articleid,
        });

        if (hasLocaleData.length) {
          await db.tx(`update-${entryType}`, async t => {
            await t.none(UPDATE_DRAFT_LOCALIZED_TEXT, localizedData);
          });
        } else {
          await db.tx(`update-${entryType}`, async t => {
            await t.none(INSERT_LOCALIZED_TEXT, localizedData);
          });
        }
      }
    }
  }

  newEntry.post_date = Date.now();
  newEntry.updated_date = Date.now();
  updatedEntry.title = newEntry.title;
  updatedEntry.description = newEntry.description;

  author.timestamp = new Date()
    .toJSON()
    .slice(0, 19)
    .replace("T", " ");
  updatedEntry.published = false;
  if (isNaN(updatedEntry.is_component_of)) {
    updatedEntry.is_component_of = 0;
  }
  if (isNaN(updatedEntry.number_of_participants)) {
    updatedEntry.number_of_participants = 0;
  }
  if (isNaN(updatedEntry.primary_organizer)) {
    updatedEntry.primary_organizer = 0;
  }
  if (isNaN(updatedEntry.collections)) {
    updatedEntry.collections = 0;
  }
  if (isNaN(updatedEntry.latitude)) {
    updatedEntry.latitude = 0;
  }
  if (isNaN(updatedEntry.longitude)) {
    updatedEntry.longitude = 0;
  }

  await db.tx(`update-${entryType}`, async t => {
    await t.none(INSERT_AUTHOR, author);
    await t.none(UPDATE_ENTRY, updatedEntry);
  });

  // Prepare response
  let payload = {
    OK: true,
    isPreview: false,
    articleId: params.articleid,
    article_type: newEntry.article_type,
  };

  if (req.originalUrl.indexOf("saveDraftPreview") >= 0) {
    payload["isPreview"] = true;
    payload["article"] = await getEntry(params, res);
    refreshSearch();
  }

  return { payload, thingId: params.articleid };
}


/**
 * @param {*} editedEntryId 
 * @param {*} orginalEntryId 
 */
async function applyLocalizedTextChangesToOrgin(editedEntryId, orginalEntryId, userId = null) {
  try {
    const results = await db.any(LOCALIZED_TEXT_BY_THINGID_ORDERBY, {thingid: editedEntryId});
    if(Array.isArray(results) && results.length){
      for (let item in results) {
        let localzedData = results[item];
        localzedData.thingid = orginalEntryId
        localzedData.id = orginalEntryId
        await db.none(INSERT_LOCALIZED_TEXT, localzedData);
      }
    }

    if(userId){
      const author = {
        user_id: userId,
        timestamp: "now",
        thingid: orginalEntryId,
      };
      console.log("applyLocalizedTextChangesToOrgin ##### author ", author);

      await db.none(INSERT_AUTHOR, author);
    }

  } catch (error) {
    console.log("applyLocalizedTextChangesToOrgin error ", error);
  }
}

function generateSlug(title) {
  return title
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim() // Remove whitespace from both ends
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
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
  maybeUpdateUserTextLocaleEntry,
  searchFilterKeys,
  searchFilterKeyLists,
  searchFiltersFromReq,
  typeFromReq,
  placeHolderPhotos,
  createLocalizedRecord,
  createUntranslatedLocalizedRecords,
  getCollections,
  validateFields,
  requireTranslation,
  limitFromReq,
  offsetFromReq,
  parseAndValidateThingPostData,
  getThingEdit,
  saveDraft,
  validateCaptcha,
  generateLocaleArticle,
  publishDraft,
  applyLocalizedTextChangesToOrgin,
  generateSlug
};
