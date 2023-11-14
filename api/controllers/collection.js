"use strict";
const express = require("express");
const cache = require("apicache");
const fs = require("fs");
const fetch = require('isomorphic-fetch');

const {
  db,
  as,
  CREATE_COLLECTION,
  COLLECTION_BY_ID_LOCALE,
  COLLECTION_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_COLLECTION,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  FEATURED_MAP,
  ENTRIES_BY_COLLECTION_ID,
  ENTRIES_SUMMARY_BY_COLLECTION_ID,
  refreshSearch,
  ErrorReporter,
} = require("../helpers/db");

const {
  setConditional,
  maybeUpdateUserText,
  parseGetParams,
  validateUrl,
  verifyOrUpdateUrl,
  returnByType,
  fixUpURLs,
  createLocalizedRecord,
  parseAndValidateThingPostData,
  generateLocaleArticle,
  validateFields,
  limitFromReq,
  getThingEdit,
  offsetFromReq,
  validateCaptcha,
  createUntranslatedLocalizedRecords,
  maybeUpdateUserTextLocaleEntry
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");
const { RESPONSE_LIMIT } = require("./../../constants.js");
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const COLLECTION_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/collection-structure.json", "utf8")
);
const { SUPPORTED_LANGUAGES } = require("../../constants");

const {
  createCSVEntry,
  uploadCSVFile
} = require("../helpers/export-helpers");

var thingCollectionid = null;

// strip off final character (assumed to be "s")
const singularLowerCase = name =>
  (name.slice(-1) === "s" ? name.slice(0, -1) : name).toLowerCase();

// just get the type, if specified
const typeFromReq = req => {
  var cat = singularLowerCase(req.query.selectedCategory || "Alls");
  let selectedCategoryValues = ["all", "case", "method", "organization"];
  if (selectedCategoryValues.indexOf(cat) < 0) {
    cat = "all";
  }
  return cat === "all" ? "thing" : cat;
};

const getTypes = params => {
  let types = ["case", "method", "organization"];

  if (["case", "method", "organizations"].includes(params.selectedCategory)) {
    if (params.selectedCategory === "organizations") {
      types = ["organization"];
    } else {
      types = [params.selectedCategory];
    }
  }

  return types;
};

function randomTexture() {
  let index = Math.floor(Math.random() * 6) + 1;
  return `/images/texture_${index}.svg`;
}

async function postCollectionNewHttp(req, res) {
  // create new `collection` in db
  
  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;
  try {
    cache.clear();
    //validate captcha start
    try {
      supportedLanguages = SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
    } catch (error) {
      supportedLanguages = [];
    }
    for (let i = 0; i < supportedLanguages.length; i++) {
      const lang = supportedLanguages[i];
      if (req.body[lang]["g-recaptcha-response"]){
        let resKey = req.body[lang]["g-recaptcha-response"];
        captcha_error_message = req.body[lang].captcha_error;
        urlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_SITE_SECRET}&response=${resKey}`;
      }
    }

    let checkReCaptcha = await validateCaptcha(urlCaptcha);
    if (!checkReCaptcha) {
      return res.status(400).json({
        OK: false,
        errors: captcha_error_message,
      });
    }
    //validate captcha end
    // let title = req.body.title;
    // let body = req.body.body || req.body.summary || "";
    // let description = req.body.description;
    // let original_language = req.body.original_language || "en";
    // const errors = validateFields(req.body, "collection");

    let {
      hasErrors,
      langErrors,
      localesToTranslate,
      localesToNotTranslate,
      originalLanguageEntry
    } = parseAndValidateThingPostData(generateLocaleArticle(req.body, req.body.entryLocales), "collection");

    if (hasErrors) {
      return res.status(400).json({
        OK: false,
        errors: langErrors,  
      });
    }

    let title = originalLanguageEntry.title;
    let body = originalLanguageEntry.body || originalLanguageEntry.summary || "";
    let description = originalLanguageEntry.description;
    let original_language = originalLanguageEntry.original_language || "en";

    const thing = await db.one(CREATE_COLLECTION, {
      title,
      body,
      description,
      original_language,
    });

    req.params.thingid = thing.thingid;
    const {article, errors} = await collectionUpdate(req, res, originalLanguageEntry);

    if (errors) {
      return res.status(400).json({
        OK: false,
        errors,
      });
    }

    localesToNotTranslate = localesToNotTranslate.filter(el => el.language !== originalLanguageEntry.language);
    let localizedData = {
      body: body,
      description: description,
      language: original_language,
      title: title
    };

    const filteredLocalesToTranslate = localesToTranslate.filter(locale => !(locale === 'entryLocales' || locale === 'originalEntry' || locale === originalLanguageEntry.language));

    if (filteredLocalesToTranslate.length)  {
      createLocalizedRecord(localizedData, thing.thingid, filteredLocalesToTranslate, req.body.entryLocales);
    } if (localesToNotTranslate.length > 0) {
      createUntranslatedLocalizedRecords(localesToNotTranslate, thing.thingid, localizedData);
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

function getUpdatedCollection(user, params, newCollection, oldCollection) {
  const updatedCollection = Object.assign({}, oldCollection);
  const er = new ErrorReporter();
  const cond = (key, fn) =>
    setConditional(updatedCollection, newCollection, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("verified", as.boolean);
    cond("original_language", as.text);
    cond("post_date", as.date);
    cond("updated_date", as.date);
    cond("updated_date", as.date);
    cond("reviewed_by", as.text);
    cond("reviewed_at", as.date);
  }

  // media lists
  ["links", "videos", "audio", "evaluation_links"].map(key =>
    cond(key, as.media)
  );
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));
  return [updatedCollection, er];
}
async function postCollectionUpdateHttp(req, res) {
  // cache.clear();
  
  const params = parseGetParams(req, "collection");
  const { articleid } = params;
  const langErrors = [];
  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;

  if(!Object.keys(req.body).length) {
    const articleRow = await (await db.one(COLLECTION_BY_ID, params));
    const article = articleRow.results;

    if (!article.latitude && !article.longitude) {
      article.latitude = '';
      article.longitude = '';
    }

    try {
      supportedLanguages = SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
    } catch (error) {
      supportedLanguages = [];
    }

    var entryLocaleData = {
      title: {},
      description: {},
      body: {},
    };
    var title = {};
    var desc = {};
    var body = {};

    for (let i = 0; i < supportedLanguages.length; i++) {
      const lang = supportedLanguages[i];
      let results = await db.any(LOCALIZED_TEXT_BY_ID_LOCALE, {
        language: lang,
        thingid: article.id
      });

      if (lang === article.original_language) {
        req.body[lang] = article;

        title[lang] = results[0].title;
        desc[lang] = results[0].description;
        body[lang] = results[0].body;

      } else {
        const otherLangArticle = {
          title: (results[0]?.title) ?? '',
          description: results[0]?.description ?? '',
          body: results[0]?.body ?? ''
        };

        if (results[0]?.title) {
          title[lang] = results[0].title;
        }

        if (results[0]?.description) {
          desc[lang] = results[0].description;
        }

        if (results[0]?.body) {
          body[lang] = results[0].body;
        }
        req.body[lang] = otherLangArticle;
      }

      entryLocaleData = {
        title: title,
        description: desc,
        body: body
      };

      req.body['entryLocales'] = entryLocaleData;
    }

  }

  //validate captcha start
  try {
    supportedLanguages = SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
  } catch (error) {
    supportedLanguages = [];
  }
  for (let i = 0; i < supportedLanguages.length; i++) {
    const lang = supportedLanguages[i];
    if (req.body[lang]["g-recaptcha-response"]){
      let resKey = req.body[lang]["g-recaptcha-response"];
      captcha_error_message = req.body[lang].captcha_error;
      urlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_SITE_SECRET}&response=${resKey}`;
    }
  }

  let checkReCaptcha = await validateCaptcha(urlCaptcha);
  if (!checkReCaptcha) {
    return res.status(400).json({
      OK: false,
      errors: captcha_error_message,
    });
  }
  //validate captcha end

  const localeEntries = generateLocaleArticle(req.body, req.body.entryLocales, true);
  let originalLanguageEntry;
  let entryOriginalLanguage;

  for (const entryLocale in localeEntries) {
    if (req.body.hasOwnProperty(entryLocale)) {
      const entry = localeEntries[entryLocale];

      if (req.body.hasOwnProperty(entry.original_language)){
        entryOriginalLanguage = entry.original_language;
      }
      if (entryLocale === entry.original_language) {
        originalLanguageEntry = entry;
      }
      let errors = validateFields(entry, "collection");
      errors = errors.map(e => `${SUPPORTED_LANGUAGES.find(locale => locale.twoLetterCode === entryLocale).name}: ${e}`);
      langErrors.push({ locale: entryLocale, errors });
      await collectionUpdate(req, res, entry);
    }
  }
  const hasErrors = !!langErrors.find(errorEntry => errorEntry.errors.length > 0);
  if (hasErrors) {
    return res.status(400).json({
      OK: false,
      errors: langErrors,
    });
  }

  if(originalLanguageEntry){
    await collectionUpdate(req, res, originalLanguageEntry);
  }
  const localeEntriesArr = [].concat(...Object.values(localeEntries));

  await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
  const freshArticle = await getCollection(params, res);
  res.status(200).json({
    OK: true,
    article: freshArticle,
  });
  refreshSearch();
}

async function collectionUpdate(req, res, entry = undefined) {
  const params = parseGetParams(req, "collection");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newCollection = entry || req.body;
  const errors = validateFields(newCollection, "collection");
  // const isNewCollection = !newCollection.article_id;
  if (errors.length > 0) {
    return res.status(400).json({
      OK: false,
      errors: errors,
    });
  }

  newCollection.links = verifyOrUpdateUrl(newCollection.links || []);

  // if this is a new collection, we don't have a post_date yet, so we set it here
  if (!newCollection.post_date) {
    newCollection.post_date = Date.now();
  }

  // Override updated_date from request because the field in the client is not editable.
  newCollection.updated_date = Date.now();

  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle: oldCollection,
  } = await maybeUpdateUserTextLocaleEntry(newCollection, req, res, "collection");
  const [updatedCollection, er] = getUpdatedCollection(
    user,
    params,
    newCollection,
    oldCollection
  );

  if (isNaN(updatedCollection.number_of_participants)) {
    updatedCollection.number_of_participants = null;
  }

  //get current date when user.isAdmin is false;
  updatedCollection.updated_date = !user.isadmin
    ? "now"
    : updatedCollection.updated_date;
  updatedCollection.post_date = !updatedCollection.published ? "now" : updatedCollection.post_date;
  newCollection.post_date = !updatedCollection.published ? Date.now() : updatedCollection.post_date;

  updatedCollection.published = true;
  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-collection", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(INSERT_LOCALIZED_TEXT, updatedText);
      });
      //if this is a new collection, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newCollection.creator
            ? newCollection.creator
            : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newCollection.post_date)
        };
        const updatedBy = {
          user_id: newCollection.last_updated_by
            ? newCollection.last_updated_by
            : params.userid,
          thingid: params.articleid,
          updated_date: newCollection.updated_date || "now",
        };
        await db.tx("update-collection", async t => {
          await t.none(UPDATE_AUTHOR_FIRST, creator);
          await t.none(UPDATE_AUTHOR_LAST, updatedBy);

          await t.none(UPDATE_COLLECTION, updatedCollection);
        });
      }
    } else {
      await db.tx("update-collection", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(UPDATE_COLLECTION, updatedCollection);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    const freshArticle = await getCollection(params, res);
    return{ article: freshArticle};
  } else {
    logError(`400 with errors: ${er.errors.join(", ")}`);
    return {errors: er.errors};
  }
}

async function getCollection(params, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRow = await db.one(COLLECTION_BY_ID, params);
    const article = articleRow.results;
    fixUpURLs(article);

    return article;
  } catch (error) {
    // only log actual excaptional results, not just data not found
    if (error.message !== "No data returned from the query.") {
      logError(error);
    }
    // if no entry is found, render the 404 page
    return null;
  }
}

async function getCollectionHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "collection");
  const articles = await getCollection(params, res, req);
  const type = typeFromReq(req);
  const limit = limitFromReq(req);
  const offset = offsetFromReq(req);
  const types = getTypes(params);
  const articleid = params.articleid;
  const facets = `AND collections @> ARRAY[${articleid}]`;

  if(req.query.returns == "csv"){
    if (!req.user){
      req.session.returnTo = req.originalUrl;
      res.redirect("/login");
    } else {
      let csv_export_id = await createCSVEntry(req.user.id, type);
      let uploadCSVFiles = uploadCSVFile(user_query, limit, langQuery, lang, type, parsed_query, req, csv_export_id);
      return res.status(200).redirect("/exports/csv");
    }
  } else {

    // always fetch all article types so we can calculate totals for a collection
    let results = await db.any(ENTRIES_BY_COLLECTION_ID, {
      query: null,
      limit: limit ? limit : null, // null is no limit in SQL
      offset: offset,
      language: as.value(req.cookies.locale || "en"),
      sortby: "updated_date",
      userId: req.user ? req.user.id : null,
      types: types,
      facets: facets
    });
    
    // get summary of article types for the collection
    const summaryRow = await db.one(ENTRIES_SUMMARY_BY_COLLECTION_ID, {articleid, facets});
    const summary = summaryRow.results;
    let numArticlesByType = {
      case: summary.total_cases,
      method: summary.total_methods,
      organization: summary.total_organizations,
    };

    // const limit = 20; // number of entries displayed on one page
    let total, pages;

    // calculate pages and totals and add random texture url if no images are present
    if (results) {
      total = Number(results.length ? results[0].total || results.length : 0);
      pages = total ? Math.max(Math.ceil(total / RESPONSE_LIMIT)) : null;

      // for each entry, use a random texture image if there are no images uploaded
      results = results.map(obj => {
        if (obj.photos.length === 0) {
          obj.photos = [{ url: randomTexture() }];
        }
        return obj;
      });
    }

    if (!articles) {
      res.status(404).render("404");
      return null;
    }
    const staticText = await getEditStaticText(params);
    returnByType(
      res,
      params,
      articles,
      staticText,
      req.user,
      results,
      total,
      pages,
      numArticlesByType
    );

  }
}

async function getEditStaticText(params) {
  let staticText = {};
  return staticText;
}

async function getCollectionEditHttp(req, res) {
  const params = parseGetParams(req, "collection");
  params.view = "edit";
  thingCollectionid = null;
  const articles = await getThingEdit(params, COLLECTION_BY_ID_LOCALE, res);
  if (!articles) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, articles, staticText, req.user);
}

function getUpdatedCollection(user, params, newCollection, oldCollection) {
  const updatedCollection = Object.assign({}, oldCollection);
  const er = new ErrorReporter();
  const cond = (key, fn) =>
    setConditional(updatedCollection, newCollection, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("verified", as.boolean);
    cond("original_language", as.text);
    cond("post_date", as.date);
    cond("completeness", as.text);
    cond("updated_date", as.date);
    cond("updated_date", as.date);
    cond("reviewed_by", as.text);
    cond("reviewed_at", as.date);
  } else {
    newCollection.collections = updatedCollection.collections;
  }

  cond("published", as.boolean);

  // media lists
  ["links", "videos", "audio"].map(key => cond(key, as.media));
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));

  return [updatedCollection, er];
}

async function saveCltnDraft(req, res, entry = undefined) {
  const args = {
    LOCALIZED_TEXT_BY_ID_LOCALE,
    UPDATE_DRAFT_LOCALIZED_TEXT,
    INSERT_LOCALIZED_TEXT,
    INSERT_AUTHOR,
    UPDATE_AUTHOR_FIRST,
    UPDATE_ENTRY: UPDATE_METHOD,
    CREATE_ENTRY_QUERY: CREATE_METHOD,
    refreshSearch,
    thingId: req.body.entryId,
    getUpdatedEntry: getUpdatedCollection,
    getEntry: getCollection,
    entryType: "method",
  };
  const { payload, thingId } = await saveDraft(req, res, args);
  thingCollectionid = req.body.entryId;
  res.status(200).json(payload);
}

async function saveCollectionDraft(req, res, entry = undefined) {


  const localeEntries = generateLocaleArticle(req.body, req.body.entryLocales, true);
  let entryData;

  console.log("req.body ", JSON.stringify(req.body));
  console.log("entry ", JSON.stringify(req.body[entryLocales]));

  const params = parseGetParams(req, "collection");
    const user = req.user;
    const { articleid, type, view, userid, lang, returns } = params;

    for (const entryLocale in req.body.entryLocales) {
      if (req.body.hasOwnProperty(entryLocale)) {
        const entry = req.body[entryLocale];
        if(entryLocale === entry.original_language) {
          entryData = entry;
        }
      }
    }

    let title = entryData.title || '';
    let body = entryData.body || '';
    let description = entryData.description || '';
    let original_language = entryData.original_language || "en";

    if (!thingCollectionid && !articleid) {
      const thing = await db.one(CREATE_COLLECTION, {
        title,
        body,
        description,
        original_language,
      });
    
      thingCollectionid = thing.thingid;
      }
      req.params.thingid = thingCollectionid ?? articleid;
      params.articleid = req.params.thingid;

      const newCollection = entryData;
      const isNewCollection = !newCollection.article_id;
    

    const {
      updatedText,
      author,
      oldArticle,
    } = await maybeUpdateUserTextLocaleEntry(newCollection, req, res, "collection");
    const [updatedCollection, er] = getUpdatedCollection(user, params, newCollection, oldArticle);
    //get current date when user.isAdmin is false;
  
    for (const entryLocale in localeEntries) {
      if (req.body.hasOwnProperty(entryLocale)) {
        const entry = localeEntries[entryLocale];
          if (entry.title) {
            const articeLocale = {
              title : entry.title,
              description: entry.description,
              body: entry.body,
              id: params.articleid,
              language: entryLocale
               };
         
               await db.tx("update-collection", async t => {
                 await t.none(INSERT_LOCALIZED_TEXT, articeLocale);
               });  
        }
      }
    }

 
    newCollection.post_date = Date.now();
    newCollection.updated_date = Date.now();
  
    updatedCollection.title = newCollection.title;
    updatedCollection.description = newCollection.description;

    if (updatedCollection.published && !isNewCollection) return;

  author.timestamp = new Date().toJSON().slice(0, 19).replace('T', ' ');
  updatedCollection.published = false;
      await db.tx("update-collection", async t => {
        
        if (isNewCollection) {
          await t.none(INSERT_AUTHOR, author);
        }
      });
      //if this is a new Collection, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newCollection.creator ? newCollection.creator : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newCollection.post_date)

        };
        await db.tx("update-collection", async t => {
            if (updatedCollection.verified) {
              updatedCollection.reviewed_by = creator.user_id;
              updatedCollection.reviewed_at = "now";
            }

            if (!isNewCollection) {
              var userId = oldArticle.creator.user_id.toString();
              var creatorTimestamp = new Date(oldArticle.post_date);
              if (userId == creator.user_id && creatorTimestamp.toDateString() === creator.timestamp.toDateString()) {
                await t.none(INSERT_AUTHOR, author);
                updatedCollection.updated_date = "now";
              } else {
                await t.none(UPDATE_AUTHOR_FIRST, creator);
              }
            }
            
          await t.none(UPDATE_COLLECTION, updatedCollection);

        });
      } else {
        await db.tx("update-collection", async t => {
          await t.none(INSERT_AUTHOR, author);
          await t.none(UPDATE_COLLECTION, updatedCollection);
        });
      }

    if (req.originalUrl.indexOf("saveDraftPreview") >= 0) {
      const freshArticle = await getCollection(params, res);
      res.status(200).json({
        OK: true,
        article: freshArticle,
        isPreview: true
      });
      refreshSearch();
    } else {
      res.status(200).json({
        OK: true,
        isPreview: false
      })
    }
}

async function getCollectionNewHttp(req, res) {
  const params = parseGetParams(req, "collection");
  params.view = "edit";
  const articles = COLLECTION_STRUCTURE;
  thingCollectionid = null;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, articles, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getCollectionEditHttp);
router.get("/new", requireAuthenticatedUser(), getCollectionNewHttp);
router.post("/new", requireAuthenticatedUser(), postCollectionNewHttp);
router.get("/:thingid", getCollectionHttp);
router.post("/:thingid", requireAuthenticatedUser(), postCollectionUpdateHttp);
router.post("/new/saveDraft", requireAuthenticatedUser(), saveCltnDraft);
router.post("/:thingid/saveDraft", requireAuthenticatedUser(), saveCltnDraft);
router.post("/:thingid/saveDraftPreview", requireAuthenticatedUser(), saveCltnDraft);

module.exports = {
  collection_: router,
  getCollectionEditHttp,
  getCollectionNewHttp,
  postCollectionNewHttp,
  getCollectionHttp,
  postCollectionUpdateHttp,
};
