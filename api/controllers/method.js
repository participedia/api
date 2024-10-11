"use strict";

const express = require("express");
const cache = require("apicache");
const fs = require("fs");
const fetch = require("isomorphic-fetch");

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
  UPDATE_DRAFT_LOCALIZED_TEXT,
  THING_BY_ORGINAL_ENTRY_ID,
  COPY_METHOD,
  DELETE_EDITED_METHODS_ENTRY,
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
  publishDraft,
  applyLocalizedTextChangesToOrgin,
  generateSlug,
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

  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;
  try {
    cache.clear();
    //validate captcha start
    try {
      supportedLanguages =
        SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
    } catch (error) {
      supportedLanguages = [];
    }
    for (let i = 0; i < supportedLanguages.length; i++) {
      const lang = supportedLanguages[i];
      if (req.body[lang]["g-recaptcha-response"]) {
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
      originalLanguageEntry,
    } = parseAndValidateThingPostData(
      generateLocaleArticle(req.body, req.body.entryLocales),
      "method"
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

    let title = originalLanguageEntry.title;
    let body =
      originalLanguageEntry.body || originalLanguageEntry.summary || "";
    let description = originalLanguageEntry.description;
    let original_language = originalLanguageEntry.original_language || "en";

    if (!req.body.entryId) {
      const thing = await db.one(CREATE_METHOD, {
        title,
        body,
        description,
        original_language,
        hidden,
      });
      req.params.thingid = thing.thingid;
    } else {
      req.params.thingid = req.body.entryId;
    }

    const { article, errors } = await methodUpdate(
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
    localesToNotTranslate = localesToNotTranslate.filter(
      el => el.language !== originalLanguageEntry.language
    );
    let localizedData = {
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
        req.params.thingid,
        filteredLocalesToTranslate,
        req.body.entryLocales
      );
    }
    if (localesToNotTranslate.length > 0) {
      await createUntranslatedLocalizedRecords(
        localesToNotTranslate,
        req.params.thingid
      );
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
    if(!params.articleid){
      return null;
    }

    // get method id => by friendly id
    const result = await db.oneOrNone('SELECT id FROM methods WHERE friendly_id = $1', [params.articleid]);
    if(result){
      params.articleid = as.integer(result.id) ; // update the params of articleid = id
    }

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

  const params = parseGetParams(req, "method");
  // const user = req.user;
  const { articleid, datatype, lang } = params;
  const langErrors = [];
  const originLang = lang;
  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;
  let article = "";
  const articleRow = await db.one(METHOD_BY_ID, params);
  article = articleRow.results;

  if (!Object.keys(req.body).length) {

    if (!article.latitude && !article.longitude) {
      article.latitude = "";
      article.longitude = "";
    }

    try {
      supportedLanguages =
        SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
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
        thingid: article.id,
      });

      if (lang === article.original_language) {
        req.body[lang] = article;

        title[lang] = results[0].title;
        desc[lang] = results[0].description;
        body[lang] = results[0].body;
      } else {
        const otherLangArticle = {
          title: results[0]?.title ?? "",
          description: results[0]?.description ?? "",
          body: results[0]?.body ?? "",
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
        body: body,
      };
    }
    req.body["entryLocales"] = entryLocaleData;
  }

  //validate captcha start
  try {
    supportedLanguages =
      SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
  } catch (error) {
    supportedLanguages = [];
  }
  for (let i = 0; i < supportedLanguages.length; i++) {
    const lang = supportedLanguages[i];
    if (req.body[lang]["g-recaptcha-response"]) {
      let resKey = req.body[lang]["g-recaptcha-response"];
      captcha_error_message = req.body[lang].captcha_error;
      urlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_SITE_SECRET}&response=${resKey}`;
    }
  }

  //validate captcha end
  let checkReCaptcha = await validateCaptcha(urlCaptcha);
  if (!checkReCaptcha) {
    return res.status(400).json({
      OK: false,
      errors: captcha_error_message,
    });
  }

  if (!article.published && !article.hidden) {
    publishDraft(req, res, methodUpdate, "method");
    return;
  }

  const localeEntries = generateLocaleArticle(
    req.body,
    req.body.entryLocales,
    true
  );
  let originalLanguageEntry;
  let entryOriginalLanguage;
  const localeEntriesArr = [];

  for (const entryLocale in localeEntries) {
    if (req.body.hasOwnProperty(entryLocale)) {
      const entry = localeEntries[entryLocale];
      if (req.body.hasOwnProperty(entry.original_language)) {
        entryOriginalLanguage = entry.original_language;
      }
      if (entryLocale === entry.original_language) {
        originalLanguageEntry = entry;
      }
      let errors = validateFields(entry, "method");
      errors = errors.map(
        e =>
          `${
            SUPPORTED_LANGUAGES.find(
              locale => locale.twoLetterCode === entryLocale
            ).name
          }: ${e}`
      );
      langErrors.push({ locale: entryLocale, errors });

      if (originLang == entryLocale) {
        localeEntriesArr.push(entry);
      }
      // await methodUpdate(req, res, entry);
    }
  }
  const hasErrors = !!langErrors.find(
    errorEntry => errorEntry.errors.length > 0
  );
  if (hasErrors) {
    return res.status(400).json({
      OK: false,
      errors: langErrors,
    });
  }

  /**
   * NON Approved user
   * is editing && entry is published && entry not hidden 
   * is editing entry && not admin && non approved user => create a copy of that entry and fill orginal_entry_id
   */
  const user = req.user;
  if(!user.isadmin && !originalLanguageEntry.hidden && (user.accepted_date === null || user.accepted_date === "")){
    const { editMethod, errors }  = await copyMethod(originalLanguageEntry, params, req, res);
    if (errors) {
      return res.status(400).json({
        OK: false,
        errors,
      });
    }
    if(editMethod){
      return res.status(200).json({
        OK: true,
        article: editMethod,
      });
    }
  }
  /**
   * apply changes of non approved changes
   * if admin published the entry
   */
  let isCopyProcess = false; // in case the admin published the copy entry that was editing by non approved user
  if(user.isadmin && article.orginal_entry_id && article.hidden){
    const orginalEntryId = article.orginal_entry_id;
    const createdId = (article.creator && article.creator.user_id) ? article.creator.user_id : null // user id
    await applyLocalizedTextChangesToOrgin(article.id, orginalEntryId, createdId)
    await db.any(DELETE_EDITED_METHODS_ENTRY, {thingid: article.id})
    req.params.thingid = orginalEntryId;
    params.thingid = orginalEntryId;
    params.articleid = orginalEntryId;
    originalLanguageEntry.hidden = false;
    isCopyProcess = true;
  }
  /**
   * *********************** END editing entry of non approved user
   */


  if(originalLanguageEntry){
    await methodUpdate(req, res, originalLanguageEntry, isCopyProcess);
  }
  // const localeEntriesArr = [].concat(...Object.values(localeEntries));

  // await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
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
          timestamp: new Date(newMethod.post_date),
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

async function postMethodUpdatePreview(req, res) {
  const params = parseGetParams(req, "method");
  let hidden = false;
  let published = true;
  let thingid = req.body.thingid;
  if (req.user.accepted_date === null || req.user.accepted_date === "") {
    hidden = true;
  }

  try {
    const paramsEntryReview = {
      hidden: hidden,
      published: published,
      id: thingid,
    };
    const entryReview = await db.none(ENTRY_REVIEW, paramsEntryReview);
    const articleRow = await db.one(CASE_BY_ID, params);
    const article = articleRow.results;

    res.status(200).json({
      OK: true,
      article: article,
    });
  } catch (error) {
    return res.status(400).json({
      OK: false,
      errors: error.message,
    });
  }
}

async function methodUpdate(req, res, entry = undefined, isCopyProcess = false) {
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
  updatedMethod.post_date = !updatedMethod.published
    ? "now"
    : updatedMethod.post_date;
  newMethod.post_date = !updatedMethod.published
    ? Date.now()
    : updatedMethod.post_date;
  author.timestamp = new Date()
    .toJSON()
    .slice(0, 19)
    .replace("T", " ");
  updatedMethod.published = true;

  if (req.user.accepted_date === null || req.user.accepted_date === "") {
    updatedMethod.hidden = true;
  }

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
          timestamp: new Date(newMethod.post_date),
        };
        await db.tx("update-method", async t => {
          if (!isNewMethod) {
            if (updatedMethod.verified) {
              updatedMethod.reviewed_by = creator.user_id;
              updatedMethod.reviewed_at = "now";
            }

            var userId = oldMethod.creator.user_id.toString();
            var creatorTimestamp = new Date(oldMethod.post_date);
            if (
              userId == creator.user_id &&
              creatorTimestamp.toDateString() ===
                creator.timestamp.toDateString()
            ) {
              await t.none(INSERT_AUTHOR, author);
              updatedMethod.updated_date = "now";
            } else {

              if(!isCopyProcess){
                await t.none(UPDATE_AUTHOR_FIRST, creator);
              }
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
    
    // add/update the freindly id
    if(updatedText && updatedText.title && updatedText.title != '' &&  updatedText.language === 'en'){
      await updateFriendlyId(updatedText.id, updatedText.title);
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

async function updateFriendlyId(entryId, enteryTitle) {
  try {

    if(enteryTitle){
      const title = generateSlug(enteryTitle);

      const existingEntry = await db.oneOrNone(
        `SELECT friendly_id FROM methods WHERE friendly_id = $1 AND id != $2`,
        [title, entryId]
      );

      let newFriendlyId = title;

      // Step 2: If it exists, modify the title to make it unique
      if (existingEntry) {
        newFriendlyId = `${title}-1`;
        // Ensure uniqueness by checking if the newFriendlyId already exists
        let suffix = 1;
        while (
          await db.oneOrNone(
            `SELECT friendly_id FROM methods WHERE friendly_id = $1 AND id != $2`,
            [newFriendlyId, entryId]
          )
        ) {
          suffix += 1;
          newFriendlyId = `${title}-${suffix}`;
        }
      }

      // Step 3: Update the friendly_id column where the id matches
      await db.any(`UPDATE methods SET friendly_id = $1 WHERE id = $2 RETURNING *`, [newFriendlyId, entryId]);
    }

  } catch (error) {   
  }
}

async function createMethod(updatedText, oldArticle){
  try {
    let hidden = true;
    let title = updatedText.title ? updatedText.title : null;
    let body = updatedText.body ? updatedText.body : null;
    let description = updatedText.description ? updatedText.description : null;
    let original_language = updatedText.language ? updatedText.language : 'en';
    let orginal_entry_id = oldArticle.id;
    let local_language = updatedText.language ? updatedText.language : 'en';
    const thing = await db.one(COPY_METHOD, {
      title,
      body,
      description,
      original_language,
      hidden,
      orginal_entry_id,
      local_language
    });
    return thing.thingid;
  } catch (error) {
    throw error;
  }
}

// create a copy of entry once non approved user edit on entry
async function copyMethod(entry, params, req, res){
  try {
    const user = req.user;
    const newMethod = entry;
    const errorsValidate = validateFields(newMethod, "method");
    if (errorsValidate.length > 0) {
      return res.status(400).json({
        OK: false,
        errors: errorsValidate,
      });
    }
    newMethod.links = verifyOrUpdateUrl(newMethod.links || []);
    const {
      updatedText,
      author,
      oldArticle,
    } = await maybeUpdateUserTextLocaleEntry(newMethod, req, res, "method"); // fill data of entry & author
    
    const options = {
      articleid: oldArticle.id,
      userid: params.userid,
      lang: params.lang
    }
    let thingid;
    let isNewCopy = false;
    // check if non approved user has already has a copy of the method 
    const orginalEntryArr = (await db.any(THING_BY_ORGINAL_ENTRY_ID, options));
    if(Array.isArray(orginalEntryArr) && orginalEntryArr.length){
      const item = orginalEntryArr[0];
      thingid = item.id;
      updatedText.id = thingid;
      await db.tx("update-method", async t => {
        await t.none(INSERT_LOCALIZED_TEXT, updatedText);
      });
    } else {
      thingid = await createMethod(updatedText, oldArticle);
      isNewCopy = true;
    }

    params.thingid = thingid;
    params.articleid = thingid;
    const [updatedMethod, er] = getUpdatedMethod(user, params, newMethod, oldArticle); // map columns of method

    if(isNaN(updatedMethod.number_of_participants)) {
      updatedMethod.number_of_participants = null;
    }

    //get current date when user.isAdmin is false;
    updatedMethod.updated_date = !user.isadmin ? "now" : updatedMethod.updated_date;
    author.timestamp = 'now';

    updatedMethod.id = thingid;
    updatedMethod.hidden = true;
    author.thingid = thingid;
    if(isNewCopy){
      updatedMethod.original_language = updatedText.language ? updatedText.language : 'en';
    }

    if (!er.hasErrors()) {
      await db.tx("update-method", async t => {
        if(isNewCopy){
          await t.none(INSERT_AUTHOR, author);
        }
        await t.none(UPDATE_METHOD, updatedMethod);
      });
      const freshArticle = await getMethod(params, res);
      return {editMethod: freshArticle};
    } else{
      logError(`400 with errors: ${er.errors.join(", ")}`);
      return { errors: er.errors};
    }

  } catch (error) {
    return {errors: error}
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
    "purpose_method",
  ].map(key => cond(key, as.methodkeys));
  // list of {id, type, title}
  ["specific_methods_tools_techniques", "collections"].map(key =>
    cond(key, as.ids)
  );
  return [updatedMethod, er];
}

async function getMethodHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "method", true);
  const article = await getMethod(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }
  
  if(!article.published){
    if(req.user && !req.user.isadmin && req.user.id !== article.creator.user_id){
      return res.status(404).render("waiting-for-approval");
    }
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
  
  if(Array.isArray(articles) && articles.length){
    const article = articles[0];
    if(!article.published && req.user && (!req.user.isadmin && req.user.id !== article.creator.user_id) ){
      res.status(404).render("access-denied");
      return null;
    }
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
    thingId: req.body.entryId,
    getUpdatedEntry: getUpdatedMethod,
    getEntry: getMethod,
    entryType: "method",
  };
  const { payload, thingId } = await saveDraft(req, res, args);
  thingMethodid = req.body.entryId;
  res.status(200).json(payload);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getMethodEditHttp);
router.get("/new", requireAuthenticatedUser(), getMethodNewHttp);
router.post(
  "/new",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postMethodNewHttp
);
// these have to come *after* /new or BAD THINGS HAPPEN
router.get("/:thingid/:language?", setAndValidateLanguage(), getMethodHttp);
router.post(
  "/:thingid",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postMethodUpdateHttp
);
router.post(
  "/:thingid/preview",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postMethodUpdatePreview
);
router.post("/new/saveDraft", requireAuthenticatedUser(), saveMethodDraft);
router.post("/:thingid/saveDraft", requireAuthenticatedUser(), saveMethodDraft);
router.post(
  "/:thingid/saveDraftPreview",
  requireAuthenticatedUser(),
  saveMethodDraft
);

module.exports = {
  method: router,
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp,
  postMethodUpdatePreview,
  methodUpdateHttp,
  getUpdatedMethod,
};
