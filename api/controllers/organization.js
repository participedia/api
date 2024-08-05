"use strict";

const express = require("express");
const cache = require("apicache");
const fs = require("fs");
const fetch = require("isomorphic-fetch");

const {
  db,
  as,
  CREATE_ORGANIZATION,
  ORGANIZATION_BY_ID,
  ORGANIZATION_LOCALE_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_ORGANIZATION,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  listUsers,
  refreshSearch,
  listMethods,
  ErrorReporter,
  LOCALIZED_TEXT_BY_ID_LOCALE,
  UPDATE_DRAFT_LOCALIZED_TEXT,
  DELETE_EDITED_ORGANIZATION_ENTRY,
  COPY_ORGANIZATION,
  THING_BY_ORGINAL_ENTRY_ID,
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
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const setAndValidateLanguage = require("../middleware/setAndValidateLanguage.js");
const ORGANIZATION_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/organization-structure.json", "utf8")
);
const sharedFieldOptions = require("../helpers/shared-field-options.js");
const isPostOrPutUser = require("../middleware/isPostOrPutUser.js");
const { SUPPORTED_LANGUAGES } = require("../../constants");

var thingOrganizationid = null;

async function getEditStaticText(params) {
  let staticText = {};
  const lang = params.lang;

  staticText.authors = listUsers();
  staticText.methods = listMethods(lang).filter(article => !article.hidden);

  staticText = Object.assign({}, staticText, sharedFieldOptions);
  staticText.collections = await getCollections(lang);

  return staticText;
}

/**
 * @api {post} /organization/new Create new organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName newOrganization
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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
async function postOrganizationNewHttp(req, res) {
  // create new `organization` in db
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
    // const errors = validateFields(req.body, "organization");

    let {
      hasErrors,
      langErrors,
      localesToTranslate,
      localesToNotTranslate,
      originalLanguageEntry,
    } = parseAndValidateThingPostData(
      generateLocaleArticle(req.body, req.body.entryLocales),
      "organization"
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

    // const user_id = req.user.id;

    if (!req.body.entryId) {
      const thing = await db.one(CREATE_ORGANIZATION, {
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

    // await postOrganizationUpdateHttp(req, res);
    const { article, errors } = await organizationUpdate(
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
        articleid
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
 * @api {put} /organization/:id  Submit a new version of a organization
 * @apiGroup Organizations
 * @apiVersion 0.1.0
 * @apiName editOrganization
 * @apiParam {Number} id Organization ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} organization data
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

async function getOrganization(params, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRow = await db.one(ORGANIZATION_BY_ID, params);
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

async function postOrganizationUpdateHttp(req, res) {

  const params = parseGetParams(req, "organization");
  const { articleid, lang } = params;
  const langErrors = [];
  const originLang = lang;
  let urlCaptcha = ``;
  let captcha_error_message = "";
  let supportedLanguages;
  let article = "";

  const articleRow = await db.one(ORGANIZATION_BY_ID, params);
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

      req.body["entryLocales"] = entryLocaleData;
    }
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
    publishDraft(req, res, organizationUpdate, "organization");
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
      let errors = validateFields(entry, "organization");
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

      if(!entry.article_id && originalLanguageEntry.article_id){
        entry.article_id = originalLanguageEntry.article_id;
      }
      // await organizationUpdate(req, res, entry, true);
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
    const { editOrganization, errors }  = await copyOrganization(originalLanguageEntry, params, req, res);
    if (errors) {
      return res.status(400).json({
        OK: false,
        errors,
      });
    }
    if(editOrganization){
      return res.status(200).json({
        OK: true,
        article: editOrganization,
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
    await db.any(DELETE_EDITED_ORGANIZATION_ENTRY, {thingid: article.id})
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
    await organizationUpdate(req, res, originalLanguageEntry, true, isCopyProcess);
  }

  await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
  const freshArticle = await getOrganization(params, res);
  res.status(200).json({
    OK: true,
    article: freshArticle,
  });
  refreshSearch();
}

async function postOrganizationUpdatePreview(req, res) {
  const params = parseGetParams(req, "organization");
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

async function organizationUpdate(req, res, entry = undefined, isUpdating = false, isCopyProcess = false) {
  const params = parseGetParams(req, "organization");
  const user = req.user;
  const { articlesid, type, view, userid, lang, returns } = params;
  const newOrganization = entry || req.body;
  const errors = validateFields(newOrganization, "organization");
  const isNewOrganization = !newOrganization.article_id;

  if (errors.length > 0) {
    return res.status(400).json({
      OK: false,
      errors: errors,
    });
  }

  // Temp fix for newOrganization.links undefined
  newOrganization.links = verifyOrUpdateUrl(newOrganization.links || []);

  // if this is a new organization, we don't have a post_date yet, so we set it here
  if (!newOrganization.post_date) {
    newOrganization.post_date = Date.now();
  }

  // Override updated_date from request because the field in the client is not editable.
  newOrganization.updated_date = Date.now();
  const {
    updatedText,
    author,
    oldArticle,
  } = await maybeUpdateUserTextLocaleEntry(
    newOrganization,
    req,
    res,
    "organization"
  ); 
  if(isUpdating && updatedText.language !== newOrganization.language){
    updatedText.language = newOrganization.language;
  }
  const [updatedOrganization, er] = getUpdatedOrganization(
    user,
    params,
    newOrganization,
    oldArticle
  );
  if (isNaN(updatedOrganization.number_of_participants)) {
    updatedOrganization.number_of_participants = null;
  }

  //get current date when user.isAdmin is false;
  updatedOrganization.updated_date = !user.isadmin
    ? "now"
    : updatedOrganization.updated_date;
  updatedOrganization.post_date = !updatedOrganization.published
    ? "now"
    : updatedOrganization.post_date;
  newOrganization.post_date = !updatedOrganization.published
    ? Date.now()
    : updatedOrganization.post_date;
  author.timestamp = new Date()
    .toJSON()
    .slice(0, 19)
    .replace("T", " ");
  updatedOrganization.published = true;

  if (req.user.accepted_date === null || req.user.accepted_date === "") {
    updatedOrganization.hidden = true;
  }

  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-organization", async t => {
        if (!isNewOrganization) {
          await t.none(INSERT_LOCALIZED_TEXT, updatedText);
        } else {
          await t.none(INSERT_AUTHOR, author);
        }
      });
      //if this is a new organization, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newOrganization.creator
            ? newOrganization.creator
            : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newOrganization.post_date),
        };
        updatedOrganization.creator = creator;

        await db.tx("update-organization", async t => {
          if (!isNewOrganization) {
            if (updatedOrganization.verified) {
              updatedOrganization.reviewed_by = creator.user_id;
              updatedOrganization.reviewed_at = "now";
            }

            var userId = updatedOrganization.creator.user_id.toString();
            var creatorTimestamp = new Date(oldArticle.post_date);

            if (
              userId == creator.user_id &&
              creatorTimestamp.toDateString() ===
                creator.timestamp.toDateString()
            ) {
              await t.none(INSERT_AUTHOR, author);
              updatedOrganization.updated_date = "now";
            } else {
              if(!isCopyProcess){
                await t.none(UPDATE_AUTHOR_FIRST, creator);
              }
            }
          }
          
          await t.none(UPDATE_ORGANIZATION, updatedOrganization);
        });
      } else {
        
        await db.tx("update-organization", async t => {
          await t.none(INSERT_AUTHOR, author);
          await t.none(UPDATE_ORGANIZATION, updatedOrganization);
        });
      }
    } else {
      
      await db.tx("update-organization", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(UPDATE_ORGANIZATION, updatedOrganization);
      });
    }
    const freshArticle = await getOrganization(params, res);
    return { article: freshArticle };
    refreshSearch();
  } else {
    logError(`400 with errors: ${er.errors.join(", ")}`);
    return { errors: er.errors };
  }
}

async function createOrganization(updatedText, oldArticle){
  try {
    let hidden = true;
    let title = updatedText.title ? updatedText.title : null;
    let body = updatedText.body ? updatedText.body : null;
    let description = updatedText.description ? updatedText.description : null;
    let original_language = updatedText.language ? updatedText.language : 'en';
    let orginal_entry_id = oldArticle.id;
    let local_language = updatedText.language ? updatedText.language : 'en';
    const thing = await db.one(COPY_ORGANIZATION, {
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
async function copyOrganization(entry, params, req, res){
  try {
    const user = req.user;
    const newOrganization = entry;
    const errorsValidate = validateFields(newOrganization, "organization");
    if (errorsValidate.length > 0) {
      return res.status(400).json({
        OK: false,
        errors: errorsValidate,
      });
    }
    newOrganization.links = verifyOrUpdateUrl(newOrganization.links || []);
    const {
      updatedText,
      author,
      oldArticle,
    } = await maybeUpdateUserTextLocaleEntry(newOrganization, req, res, "organization"); // fill data of entry & author
    
    const options = {
      articleid: oldArticle.id,
      userid: params.userid,
      lang: params.lang
    }
    let thingid;
    let isNewCopy = false;
    // check if non approved user has already has a copy of the organization 
    const orginalEntryArr = (await db.any(THING_BY_ORGINAL_ENTRY_ID, options));
    if(Array.isArray(orginalEntryArr) && orginalEntryArr.length){
      const item = orginalEntryArr[0];
      thingid = item.id;
      updatedText.id = thingid;
      await db.tx("update-organization", async t => {
        await t.none(INSERT_LOCALIZED_TEXT, updatedText);
      });
    } else {
      thingid = await createOrganization(updatedText, oldArticle);
      isNewCopy = true;
    }

    params.thingid = thingid;
    params.articleid = thingid;
    const [updatedOrganization, er] = getUpdatedOrganization(user, params, newOrganization, oldArticle); // map columns of organization
    if(isNaN(updatedOrganization.number_of_participants)) {
      updatedOrganization.number_of_participants = null;
    }

    //get current date when user.isAdmin is false;
    updatedOrganization.updated_date = !user.isadmin ? "now" : updatedOrganization.updated_date;
    updatedOrganization.id = thingid;
    updatedOrganization.hidden = true;
    author.timestamp = 'now';
    author.thingid = thingid;
    if(isNewCopy){
      updatedOrganization.original_language = updatedText.language ? updatedText.language : 'en';
    }

    if (!er.hasErrors()) {
      await db.tx("update-organization", async t => {
        if(isNewCopy){
          await t.none(INSERT_AUTHOR, author);
        }
        await t.none(UPDATE_ORGANIZATION, updatedOrganization);
      });
      const freshArticle = await getOrganization(params, res);
      return {editOrganization: freshArticle};
    } else{
      logError(`400 with errors: ${er.errors.join(", ")}`);
      return { errors: er.errors};
    }

  } catch (error) {
    return {errors: error}
  }
}

function getUpdatedOrganization(
  user,
  params,
  newOrganization,
  oldOrganization
) {
  const updatedOrganization = Object.assign({}, oldOrganization);
  const er = new ErrorReporter();
  const cond = (key, fn) =>
    setConditional(updatedOrganization, newOrganization, er, fn, key);
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
    newOrganization.collections = updatedOrganization.collections;
  }
  cond("published", as.boolean);
  // media lists
  ["links", "videos", "audio"].map(key => cond(key, as.media));
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key => cond(key, as.sourcedMedia));
  // boolean (would include "published" but we don't really support it)
  ["facilitators"].map(key => cond(key, as.yesno));
  // text
  [
    "location_name",
    "address1",
    "address2",
    "city",
    "province",
    "postal_code",
    "country",
  ].map(key => cond(key, as.text));
  ["latitude", "longitude"].map(key => cond(key, as.float));
  // key
  ["sector"].map(key => cond(key, as.organizationkeyflat));
  // list of keys
  [
    "scope_of_influence",
    "type_method",
    "type_tool",
    "specific_topics",
    "general_issues",
  ].map(key => cond(key, as.organizationkeys));
  // list of {id, type, title}
  ["specific_methods_tools_techniques", "collections"].map(key =>
    cond(key, as.ids)
  );
  return [updatedOrganization, er];
}

async function getOrganizationHttp(req, res) {
  /* This is the entry point for getting an article */
  const params = parseGetParams(req, "organization");

  const article = await getOrganization(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }

  if(!article.published){
    if(req.user && !req.user.isadmin && req.user.id !== article.creator.user_id){
      return res.status(404).render("waiting-for-approval");
    }
  }

  const staticText = {};
  returnByType(res, params, article, staticText, req.user);
}

async function saveOrganizationDraft(req, res, entry = undefined) {
  const args = {
    LOCALIZED_TEXT_BY_ID_LOCALE,
    UPDATE_DRAFT_LOCALIZED_TEXT,
    INSERT_LOCALIZED_TEXT,
    INSERT_AUTHOR,
    UPDATE_AUTHOR_FIRST,
    UPDATE_ENTRY: UPDATE_ORGANIZATION,
    CREATE_ENTRY_QUERY: CREATE_ORGANIZATION,
    refreshSearch,
    thingId: req.body.entryId,
    getUpdatedEntry: getUpdatedOrganization,
    getEntry: getOrganization,
    entryType: "organization",
  };
  const { payload, thingId } = await saveDraft(req, res, args);
  thingOrganizationid = req.body.entryId;
  res.status(200).json(payload);
}

async function getOrganizationEditHttp(req, res) {
  const params = parseGetParams(req, "organization");
  params.view = "edit";
  thingOrganizationid = null;
  const articles = await getThingEdit(params, ORGANIZATION_LOCALE_BY_ID, res);
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

async function getOrganizationNewHttp(req, res) {
  const params = parseGetParams(req, "organization");
  params.view = "edit";
  const article = ORGANIZATION_STRUCTURE;
  thingOrganizationid = null;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get(
  "/:thingid/edit",
  requireAuthenticatedUser(),
  getOrganizationEditHttp
);
router.get("/new", requireAuthenticatedUser(), getOrganizationNewHttp);
router.post(
  "/new",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postOrganizationNewHttp
);
router.get(
  "/:thingid/:language?",
  setAndValidateLanguage(),
  getOrganizationHttp
);
router.post(
  "/:thingid",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postOrganizationUpdateHttp
);
router.post(
  "/:thingid/preview",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postOrganizationUpdatePreview
);
router.post(
  "/new/saveDraft",
  requireAuthenticatedUser(),
  saveOrganizationDraft
);
router.post(
  "/:thingid/saveDraft",
  requireAuthenticatedUser(),
  saveOrganizationDraft
);
router.post(
  "/:thingid/saveDraftPreview",
  requireAuthenticatedUser(),
  saveOrganizationDraft
);

module.exports = {
  organization: router,
  postOrganizationNewHttp,
  postOrganizationUpdateHttp,
  getOrganizationHttp,
  getOrganizationEditHttp,
  getOrganizationNewHttp,
  postOrganizationUpdatePreview,
  getUpdatedOrganization,
};
