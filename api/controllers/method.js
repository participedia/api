"use strict";

const express = require("express");
const cache = require("apicache");
const fs = require("fs");
const fetch = require('isomorphic-fetch');

const {
  db,
  as,
  CREATE_METHOD,
  METHOD_BY_ID,
  METHODS_LOCALE_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_METHOD,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  listUsers,
  refreshSearch,
  ErrorReporter,
  LOCALIZED_TEXT_BY_ID_LOCALE,
  UPDATE_DRAFT_LOCALIZED_TEXT
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
  createUntranslatedLocalizedRecords,
  getCollections,
  validateFields,
  parseAndValidateThingPostData,
  maybeUpdateUserTextLocaleEntry,
  getThingEdit,
  saveDraft,
  validateCaptcha,
  generateLocaleArticle,
  publishDraft
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const setAndValidateLanguage = require("../middleware/setAndValidateLanguage.js");
const METHOD_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/method-structure.json", "utf8")
);

const sharedFieldOptions = require("../helpers/shared-field-options.js");

const isPostOrPutUser = require("../middleware/isPostOrPutUser.js");
const { SUPPORTED_LANGUAGES } = require("../../constants");
const { updateMethod } = require("../../test/data/helpers");
const { t } = require("../helpers/handlebars-helpers");
const i = require("rss-to-json");

var thingMethodid = null;

async function getEditStaticText(params) {
  let staticText = {};
  try {
    staticText.authors = listUsers();
  } catch (e) {
    logError("Error reading users in controllers/method.js getEditStaticText");
  }

  staticText = Object.assign({}, staticText, sharedFieldOptions);
  staticText.collections = await getCollections(params.lang);

  return staticText;
}

/**
 * @api {post} /method/new Create new method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName ll
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data method data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
async function postMethodNewHttp(req, res) {
  // create new `method` in db
  return false; //Disable Publish Button for awhile
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
    // const errors = validateFields(req.body, "method");

    let {
      hasErrors,
      langErrors,
      localesToTranslate,
      localesToNotTranslate,
      originalLanguageEntry
    } = parseAndValidateThingPostData(generateLocaleArticle(req.body, req.body.entryLocales), "method");

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

    const thing = await db.one(CREATE_METHOD, {
      title,
      body,
      description,
      original_language,
    });

    req.params.thingid = thing.thingid;
    const { article, errors } = await methodUpdate(req, res, originalLanguageEntry);
    if (errors) {
      return res.status(400).json({
        OK: false,
        errors,
      });
    }
    localesToNotTranslate = localesToNotTranslate.filter(el => el.language !== originalLanguageEntry.language);
    let localizedData = {
      body,
      description,
      language: original_language,
      title
    };

    const filteredLocalesToTranslate = localesToTranslate.filter(locale => !(locale === 'entryLocales' || locale === 'originalEntry' || locale === originalLanguageEntry.language));
    if (filteredLocalesToTranslate.length) {
      await createLocalizedRecord(localizedData, thing.thingid, filteredLocalesToTranslate, req.body.entryLocales);
    } if (localesToNotTranslate.length > 0) {
      await createUntranslatedLocalizedRecords(localesToNotTranslate, thing.thingid);
    }
    res.status(200).json({
      OK: true,
      article,
    });
  } catch (error) {
    logError(error);
    return res.status(400).json({ OK: false, error: error });
  }
}

/**
 * @api {put} /method/:id  Submit a new version of a method
 * @apiGroup Methods
 * @apiVersion 0.1.0
 * @apiName editMethodById
 * @apiParam {Number} thingid Method ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data method data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

async function getMethod(params, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRow = await db.one(METHOD_BY_ID, params);
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

async function postMethodUpdateHttp(req, res) {
  cache.clear();
  return false; //Disable Publish Button for awhile
  const params = parseGetParams(req, "method");
  // const user = req.user;
  const { articleid, datatype } = params;
  const langErrors = [];
  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;

  if(!Object.keys(req.body).length) {
    const articleRow = await (await db.one(METHOD_BY_ID, params));
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
    }
      req.body['entryLocales'] = entryLocaleData;

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

  if(datatype == 'draft') {
    publishDraft(req, res, methodUpdate, 'method');
    return;
  }

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
      let errors = validateFields(entry, "method");
      errors = errors.map(e => `${SUPPORTED_LANGUAGES.find(locale => locale.twoLetterCode === entryLocale).name}: ${e}`);
      langErrors.push({ locale: entryLocale, errors });
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
    await methodUpdate(req, res, originalLanguageEntry);
  }
  const localeEntriesArr = [].concat(...Object.values(localeEntries));

  await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
  const freshArticle = await getMethod(params, res);
  res.status(200).json({
    OK: true,
    article: freshArticle,
  });
  refreshSearch();
}

async function methodUpdateHttp(req, res, entry = undefined) {
  const params = parseGetParams(req, "method");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newMethod = entry || req.body;
  const errors = validateFields(newMethod, "method");
  const isNewMethod = !newMethod.article_id;

  if (errors.length > 0) {
    return res.status(400).json({
      OK: false,
      errors: errors,
    });
  }

  newMethod.links = verifyOrUpdateUrl(newMethod.links || []);

  // if this is a new method, we don't have a post_date yet, so we set it here
  if (isNewMethod) {
    newMethod.post_date = Date.now();
  }

  // if this is a new method, we don't have a updated_date yet, so we set it here
  if (isNewMethod) {
    newMethod.updated_date = Date.now();
  }

  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle,
  } = await maybeUpdateUserTextLocaleEntry(newMethod, req, res, "method");
  const [updatedMethod, er] = getUpdatedMethod(
    user,
    params,
    newMethod,
    oldArticle
  );

  if (isNaN(updatedMethod.number_of_participants)) {
    updatedMethod.number_of_participants = null;
  }

  //get current date when user.isAdmin is false;
  updatedMethod.updated_date = !user.isadmin
    ? "now"
    : updatedMethod.updated_date;

  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-method", async t => {
        if (!isNewMethod) {
          await t.none(INSERT_LOCALIZED_TEXT, updatedText);
        } else {
          await t.none(INSERT_AUTHOR, author);
        }
        await t.none(UPDATE_METHOD, updatedMethod);
      });
      //if this is a new method, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newMethod.creator ? newMethod.creator : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newMethod.post_date)
        };
        await db.tx("update-method", async t => {
          await t.none(UPDATE_AUTHOR_LAST, creator);
        });
      }
    } else {
      await db.tx("update-method", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(UPDATE_METHOD, updatedMethod);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    const freshArticle = await getMethod(params, res);
    res.status(200).json({
      OK: true,
      article: freshArticle,
    });
    refreshSearch();
  } else {
    logError(er);
    res.status(400).json({
      OK: false,
      errors: er.errors,
    });
  }
}

async function methodUpdate(req, res, entry = undefined) {
  const params = parseGetParams(req, "method");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newMethod = entry || req.body;
  const errors = validateFields(newMethod, "method");
  const isNewMethod = !newMethod.article_id;

  if (errors.length > 0) {
    return res.status(400).json({
      OK: false,
      errors: errors,
    });
  }

  newMethod.links = verifyOrUpdateUrl(newMethod.links || []);

  // if this is a new method, we don't have a post_date yet, so we set it here
  if (isNewMethod) {
    newMethod.post_date = Date.now();
  }

  // if this is a new method, we don't have a updated_date yet, so we set it here
  if (isNewMethod) {
    newMethod.updated_date = Date.now();
  }
  

  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle: oldMethod,
  } = await maybeUpdateUserTextLocaleEntry(newMethod, req, res, "method");

  const [updatedMethod, er] = getUpdatedMethod(
    user,
    params,
    newMethod,
    oldMethod
  );

  if (isNaN(updatedMethod.number_of_participants)) {
    updatedMethod.number_of_participants = null;
  }

  //get current date when user.isAdmin is false;
  updatedMethod.updated_date = !user.isadmin
    ? "now"
    : updatedMethod.updated_date;
    updatedMethod.post_date = !updatedMethod.published ? "now" : updatedMethod.post_date;
    newMethod.post_date = !updatedMethod.published ? Date.now() : updatedMethod.post_date; 
  author.timestamp = new Date().toJSON().slice(0, 19).replace('T', ' ');
  updatedMethod.published = true;
  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-method", async t => {
        if (!isNewMethod) {
          await t.none(INSERT_LOCALIZED_TEXT, updatedText);
        } else {
          await t.none(INSERT_AUTHOR, author);
        }
      });
      //if this is a new method, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newMethod.creator ? newMethod.creator : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newMethod.post_date)
        };
        await db.tx("update-method", async t => {
          if (!isNewMethod) {

            if (updatedMethod.verified) {
              updatedMethod.reviewed_by = creator.user_id;
              updatedMethod.reviewed_at = "now";
            }

            var userId = oldMethod.creator.user_id.toString();
            var creatorTimestamp = new Date(oldMethod.post_date);
            if (userId == creator.user_id && creatorTimestamp.toDateString() === creator.timestamp.toDateString()) {
              await t.none(INSERT_AUTHOR, author);
              updatedMethod.updated_date = "now";
            } else {
              await t.none(UPDATE_AUTHOR_FIRST, creator);
            }
          } 
          await t.none(UPDATE_METHOD, updatedMethod);
        });
      } else {
        await db.tx("update-method", async t => {
          await t.none(INSERT_AUTHOR, author);
          await t.none(UPDATE_METHOD, updatedMethod);
        });
      }
    } else {
      await db.tx("update-method", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(UPDATE_METHOD, updatedMethod);
      });
    }
    // the client expects this request to respond with json
    // save successful response
    const freshArticle = await getMethod(params, res);
    return { article: freshArticle };
  } else {
    logError(er);
    return { errors: er.errors };
  }
}


function getUpdatedMethod(user, params, newMethod, oldMethod) {
  const updatedMethod = Object.assign({}, oldMethod);
  const er = new ErrorReporter();
  const cond = (key, fn) =>
    setConditional(updatedMethod, newMethod, er, fn, key);
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
    newMethod.collections = updatedMethod.collections;
  }

  cond("published", as.boolean);

  // media lists
  ["links", "videos", "audio"].map(key => cond(key, as.media));
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));
  // key
  [
    "facilitators",
    "facetoface_online_or_both",
    "public_spectrum",
    "open_limited",
    "recruitment_method",
    "level_polarization",
    "level_complexity",
  ].map(key => cond(key, as.methodkey));
  // list of keys
  [
    "method_types",
    "scope_of_influence",
    "participants_interactions",
    "number_of_participants",
    "decision_methods",
    "if_voting",
    "number_of_participants",
    "purpose_method"
  ].map(key => cond(key, as.methodkeys));
  // list of {id, type, title}
  ["specific_methods_tools_techniques", "collections"].map(key => cond(key, as.ids));
  return [updatedMethod, er];
}

async function getMethodHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "method");
  const article = await getMethod(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }
  // TODO: Review
  const staticText = {};
  returnByType(res, params, article, staticText, req.user);
}

async function getMethodEditHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  thingMethodid = null;
  const articles = await getThingEdit(params, METHODS_LOCALE_BY_ID, res);
  if (!articles) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, articles, staticText, req.user);
}

async function getMethodNewHttp(req, res) {
  const params = parseGetParams(req, "method");
  params.view = "edit";
  const article = METHOD_STRUCTURE;
  thingMethodid = null;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

async function saveMethodDraft(req, res, entry = undefined) {
  const args = {
    LOCALIZED_TEXT_BY_ID_LOCALE,
    UPDATE_DRAFT_LOCALIZED_TEXT,
    INSERT_LOCALIZED_TEXT,
    INSERT_AUTHOR,
    UPDATE_AUTHOR_FIRST,
    UPDATE_ENTRY: UPDATE_METHOD,
    CREATE_ENTRY_QUERY: CREATE_METHOD,
    refreshSearch,
    thingId: thingMethodid,
    getUpdatedEntry: getUpdatedMethod,
    getEntry: getMethod,
    entryType: "method"
  };
  const {payload, thingId} = await saveDraft(req, res, args);
  thingMethodid = thingId;
  res.status(200).json(payload);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getMethodEditHttp);
router.get("/new", requireAuthenticatedUser(), getMethodNewHttp);
router.post("/new", requireAuthenticatedUser(), isPostOrPutUser(), postMethodNewHttp);
// these have to come *after* /new or BAD THINGS HAPPEN
router.get("/:thingid/:language?", setAndValidateLanguage(), getMethodHttp);
router.post("/:thingid", requireAuthenticatedUser(), isPostOrPutUser(), postMethodUpdateHttp);
router.post("/new/saveDraft", requireAuthenticatedUser(), saveMethodDraft);
router.post("/:thingid/saveDraft", requireAuthenticatedUser(), saveMethodDraft);
router.post("/:thingid/saveDraftPreview", requireAuthenticatedUser(), saveMethodDraft);

module.exports = {
  method: router,
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp,
  methodUpdateHttp
};
