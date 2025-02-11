"use strict";
const express = require("express");
const cache = require("apicache");
const equals = require("deep-equal");
const fs = require("fs");
const fetch = require("isomorphic-fetch");

const {
  db,
  as,
  CASES_BY_COUNTRY,
  CREATE_CASE,
  CASE_BY_ID,
  CASE_BY_ID_GET,
  CASES_LOCALE_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_CASE,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  listUsers,
  listCases,
  listMethods,
  listOrganizations,
  refreshSearch,
  ErrorReporter,
  LOCALIZED_TEXT_BY_ID_LOCALE,
  UPDATE_DRAFT_LOCALIZED_TEXT,
  ENTRY_REVIEW,
  COPY_CASE,
  CASE_BY_ORGINAL_ENTRY_ID,
  DELETE_EDITED_CASE_ENTRY,
} = require("../helpers/db");

const {
  setConditional,
  maybeUpdateUserText,
  maybeUpdateUserTextLocaleEntry,
  parseGetParams,
  validateUrl,
  isValidDate,
  verifyOrUpdateUrl,
  returnByType,
  fixUpURLs,
  createLocalizedRecord,
  createUntranslatedLocalizedRecords,
  getCollections,
  validateFields,
  parseAndValidateThingPostData,
  getThingEdit,
  validateCaptcha,
  saveDraft,
  generateLocaleArticle,
  publishDraft,
  applyLocalizedTextChangesToOrgin,
  generateSlug,
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const setAndValidateLanguage = require("../middleware/setAndValidateLanguage.js");
const isPostOrPutUser = require("../middleware/isPostOrPutUser.js");

var thingCaseid = null;

const CASE_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/case-structure.json", "utf8")
);
const sharedFieldOptions = require("../helpers/shared-field-options.js");
const { SUPPORTED_LANGUAGES } = require("../../constants");

/**
 * @api {post} /case/new Create new case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName newCase
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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

async function postCaseNewHttp(req, res) {
  // create new `case` in db

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

    let {
      hasErrors,
      langErrors,
      localesToTranslate,
      localesToNotTranslate,
      originalLanguageEntry,
    } = parseAndValidateThingPostData(
      generateLocaleArticle(req.body, req.body.entryLocales),
      "case"
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
    let description = originalLanguageEntry.description || "";
    let original_language = originalLanguageEntry.original_language || "en";

    if (!req.body.entryId) {
      const thing = await db.one(CREATE_CASE, {
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

    const { article, errors } = await caseUpdate(
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

    if (hidden === false) {
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
          req.params.thingid,
          localizedData
        );
      }
    }

    res.status(200).json({
      OK: true,
      article,
    });
    refreshSearch();
  } catch (error) {
    logError(error);
    res.status(400).json({ OK: false, error: error });
  }
}

/**
 * @api {put} /case/:caseId  Submit a new version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName editCase
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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

function getUpdatedCase(user, params, newCase, oldCase) {
  const updatedCase = Object.assign({}, oldCase);
  const er = new ErrorReporter();
  const cond = (key, fn) => setConditional(updatedCase, newCase, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("verified", as.boolean);
    cond("completeness", as.text);
    cond("original_language", as.text);
    cond("post_date", as.date);
    cond("updated_date", as.date);
    cond("reviewed_by", as.text);
    cond("reviewed_at", as.date);
  } else {
    newCase.collections = updatedCase.collections;
  }

  cond("published", as.boolean);

  // media lists
  ["links", "videos", "audio", "evaluation_links"].map(key =>
    cond(key, as.media)
  );
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files", "evaluation_reports"].map(key =>
    cond(key, as.sourcedMedia)
  );
  // boolean (would include "published" but we don't really support it)
  ["ongoing", "staff", "volunteers"].map(key => cond(key, as.selectBoolean));
  // yes/no (convert to boolean)
  ["impact_evidence", "formal_evaluation"].map(key => cond(key, as.yesno));
  // integer
  ["number_of_participants"].map(key => cond(key, as.integer));
  // float
  ["latitude", "longitude"].map(key => cond(key, as.float));
  // plain text
  [
    "location_name",
    "address1",
    "address2",
    "city",
    "province",
    "postal_code",
    "country",
    "funder",
  ].map(key => cond(key, as.text));
  // date
  ["start_date", "end_date"].map(key => cond(key, as.date));
  // id
  ["is_component_of", "primary_organizer"].map(key => cond(key, as.id));
  // list of {id, type, title}
  ["specific_methods_tools_techniques", "collections"].map(key =>
    cond(key, as.ids)
  );
  // key
  [
    "scope_of_influence",
    "public_spectrum",
    "legality",
    "facilitators",
    "facilitator_training",
    "facetoface_online_or_both",
    "open_limited",
    "recruitment_method",
    "time_limited",
  ].map(key => cond(key, as.casekeyflat));
  // list of keys
  [
    "general_issues",
    "specific_topics",
    "purposes",
    "approaches",
    "targeted_participants",
    "method_types",
    "participants_interactions",
    "learning_resources",
    "decision_methods",
    "if_voting",
    "insights_outcomes",
    "organizer_types",
    "funder_types",
    "change_types",
    "implementers_of_change",
    "tools_techniques_types",
  ].map(key => cond(key, as.casekeys));
  return [updatedCase, er];
}

async function caseUpdate(req, res, entry = undefined, isCopyProcess = false) {
  // cache.clear();
  const params = parseGetParams(req, "case");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newCase = entry || req.body;
  const errors = validateFields(newCase, "case");
  const isNewCase = !newCase.article_id;

  if (errors.length > 0) {
    return res.status(400).json({
      OK: false,
      errors: errors,
    });
  }

  newCase.links = verifyOrUpdateUrl(newCase.links || []);

  // if this is a new case, we don't have a post_date and update_date yet, so we set it here
  if (isNewCase) {
    newCase.post_date = Date.now();
  }

  // if this is a new case, we don't have a updated_date yet, so we set it here
  if (isNewCase) {
    newCase.updated_date = Date.now();
  }

  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle,
  } = await maybeUpdateUserTextLocaleEntry(newCase, req, res, "case"); // fill data of entry & author
  const [updatedCase, er] = getUpdatedCase(user, params, newCase, oldArticle); // map columns of cases

  const isIntegerList = ["is_component_of", "number_of_participants", "primary_organizer", "collections", "latitude", "longitude"];

  for (const key in updatedCase) {
    if (isIntegerList.includes(key)) {
      if (isNaN(updatedCase[key])) {
        updatedCase[key] = null;
      }
    }
  }

  //get current date when user.isAdmin is false;
  updatedCase.updated_date = !user.isadmin ? "now" : updatedCase.updated_date;
  updatedCase.post_date = !updatedCase.published
    ? "now"
    : (updatedCase.post_date ? updatedCase.post_date : Date.now());
  newCase.post_date = !updatedCase.published
    ? Date.now()
    : (updatedCase.post_date ? updatedCase.post_date : Date.now());
  updatedCase.published = true;
  author.timestamp = new Date()
    .toJSON()
    .slice(0, 19)
    .replace("T", " ");

  if (req.user.accepted_date === null || req.user.accepted_date === "") {
    updatedCase.hidden = true;
  }

  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-case", async t => {
        if (!isNewCase) {
          await t.none(INSERT_LOCALIZED_TEXT, updatedText);
        } else {
          await t.none(INSERT_AUTHOR, author);
        }
      });
      //if this is a new case, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newCase.creator ? newCase.creator : params.userid,
          thingid: params.articleid,
          timestamp: new Date(newCase.post_date),
        };
        await db.tx("update-case", async t => {
          if (!isNewCase) {
            if (updatedCase.verified) {
              updatedCase.reviewed_by = creator.user_id;
              updatedCase.reviewed_at = "now";
            }

            var userId = oldArticle.creator.user_id.toString();
            var creatorTimestamp = new Date(oldArticle.post_date);
            if (
              userId == creator.user_id &&
              creatorTimestamp.toDateString() ===
                creator.timestamp.toDateString()
            ) {

              await t.none(INSERT_AUTHOR, author);
              updatedCase.updated_date = "now";
            } else {
              if(!isCopyProcess){
                try {
                  return await db.none(
                    UPDATE_AUTHOR_FIRST,
                    {
                      user_id: creator.user_id,
                      thingid: creator.thingid,
                    }
                  );
                } catch (err) {
                  console.log("UPDATE_AUTHOR_FIRST error - ", err);
                }
              }
            }
          }     
          await t.none(UPDATE_CASE, updatedCase);
        });
      } else {
        await db.tx("update-case", async t => {
          await t.none(INSERT_AUTHOR, author);
          await t.none(UPDATE_CASE, updatedCase);
        });
      }
    } else {
      await db.tx("update-case", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(UPDATE_CASE, updatedCase);
      });
    }

    // add/update the freindly id
    if(updatedText && updatedText.title && updatedText.title != '' &&  updatedText.language === 'en'){
      await updateFriendlyId(updatedText.id, updatedText.title);
    }
    // the client expects this request to respond with json
    // save successful response
    const freshArticle = await getCase(params, res);
    return { article: freshArticle };
  } else {
    logError(`400 with errors: ${er.errors.join(", ")}`);
    return { errors: er.errors };
  }
}

async function updateFriendlyId(entryId, enteryTitle) {
  try {

    if(enteryTitle){
      const title = generateSlug(enteryTitle);

      const existingEntry = await db.oneOrNone(
        `SELECT friendly_id FROM cases WHERE friendly_id = $1 AND id != $2`,
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
            `SELECT friendly_id FROM cases WHERE friendly_id = $1 AND id != $2`,
            [newFriendlyId, entryId]
          )
        ) {
          suffix += 1;
          newFriendlyId = `${title}-${suffix}`;
        }
      }

      // Step 3: Update the friendly_id column where the id matches
      await db.any(`UPDATE cases SET friendly_id = $1 WHERE id = $2 RETURNING *`, [newFriendlyId, entryId]);
    }

  } catch (error) {   
  }
} 

async function createCase(updatedText, oldArticle){
  try {
    let hidden = true;
    let title = updatedText.title ? updatedText.title : null;
    let body = updatedText.body ? updatedText.body : null;
    let description = updatedText.description ? updatedText.description : null;
    let original_language = updatedText.language ? updatedText.language : 'en';
    let orginal_entry_id = oldArticle.id;
    let local_language = updatedText.language ? updatedText.language : 'en';
    const thing = await db.one(COPY_CASE, {
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
async function copyCase(entry, params, req, res){
  try {
    const user = req.user;
    const newCase = entry;
    const errorsValidate = validateFields(newCase, "case");
    if (errorsValidate.length > 0) {
      return res.status(400).json({
        OK: false,
        errors: errorsValidate,
      });
    }
    newCase.links = verifyOrUpdateUrl(newCase.links || []);
    const {
      updatedText,
      author,
      oldArticle,
    } = await maybeUpdateUserTextLocaleEntry(newCase, req, res, "case"); // fill data of entry & author
    
    const options = {
      articleid: oldArticle.id,
      userid: params.userid,
      lang: params.lang
    }
    let thingid;
    let isNewCopy = false;
    // check if non approved user has already has a copy of the case 
    const orginalEntryArr = (await db.any(CASE_BY_ORGINAL_ENTRY_ID, options));
    if(Array.isArray(orginalEntryArr) && orginalEntryArr.length){
      const item = orginalEntryArr[0];
      thingid = item.id;
      updatedText.id = thingid;
      await db.tx("update-case", async t => {
        await t.none(INSERT_LOCALIZED_TEXT, updatedText);
      });
    } else {
      thingid = await createCase(updatedText, oldArticle);
      isNewCopy = true;
    }
    params.thingid = thingid;
    params.articleid = thingid;
    const [updatedCase, er] = getUpdatedCase(user, params, newCase, oldArticle); // map columns of cases
    
    const isIntegerList = ["is_component_of", "number_of_participants", "primary_organizer", "collections", "latitude", "longitude"];

    for (const key in updatedCase) {
      if (isIntegerList.includes(key)) {
        if (isNaN(updatedCase[key])) {
          updatedCase[key] = null;
        }
      }
    }
    //get current date when user.isAdmin is false;
    updatedCase.updated_date = !user.isadmin ? "now" : updatedCase.updated_date;
    author.timestamp = 'now';

    updatedCase.id = thingid;
    updatedCase.hidden = true;
    author.thingid = thingid;
    if(isNewCopy){
      updatedCase.original_language = updatedText.language ? updatedText.language : 'en';
    }

    if (!er.hasErrors()) {
      await db.tx("update-case", async t => {
        if(isNewCopy){
          await t.none(INSERT_AUTHOR, author);
        }
        await t.none(UPDATE_CASE, updatedCase);
      });
      const freshArticle = await getCase(params, res);
      return {editCase: freshArticle};
    } else{
      logError(`400 with errors: ${er.errors.join(", ")}`);
      return { errors: er.errors};
    }

  } catch (error) {
    console.log("error copyCaes ", error);
    return {errors: error}
  }
}

// Only changes to title, description, and/or body trigger a new author and version

async function postCaseUpdateHttp(req, res) {
  try {
    // cache.clear();
    const params = parseGetParams(req, "case");
    const { articleid, lang } = params;
    const langErrors = [];
    const originLang = lang;
    let urlCaptcha = ``;
    let captcha_error_message = "";
    let supportedLanguages;
    let article = "";
  
    const articleRow = await db.one(CASE_BY_ID, params);
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
      publishDraft(req, res, caseUpdate, "case");
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
        if (entryLocale === entryOriginalLanguage) {
          originalLanguageEntry = entry;
        }
  
        let errors = validateFields(entry, "case");
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
        // await caseUpdate(req, res, entry, true); // dublicate insert
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
      const { editCase, errors }  = await copyCase(originalLanguageEntry, params, req, res);
      if (errors) {
        return res.status(400).json({
          OK: false,
          errors,
        });
      }
      if(editCase){
        return res.status(200).json({
          OK: true,
          article: editCase,
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
      await db.any(DELETE_EDITED_CASE_ENTRY, {thingid: article.id})
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
      await caseUpdate(req, res, originalLanguageEntry, isCopyProcess);
    }
    // const localeEntriesArr = [].concat(...Object.values(localeEntries));
    // await createUntranslatedLocalizedRecords(localeEntriesArr, articleid); // dublicated insert
    const freshArticle = await getCase(params, res);
    res.status(200).json({
      OK: true,
      article: freshArticle,
    });
    refreshSearch();
  } catch (error) {
    return res.status(400).json({
      OK: false,
      errors: error.message,
    });
  }
}



// Only changes to title, description, and/or body trigger a new author and version
async function postCaseUpdatePreview(req, res) {
  const params = parseGetParams(req, "case");
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

/**
 * @api {get} /case/:thingid Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnCaseById
 * @apiParam {Number} thingid Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
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

async function getCase(params, res) {
  try {
    if (Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRow = await db.one(CASE_BY_ID, params);
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

async function getCaseById(params, res) {
  try {
    if(!params.articleid){
      return null;
    }

    // get case by friendly id
    // const result = await db.oneOrNone('SELECT id FROM cases WHERE friendly_id = $1', [params.articleid]);
    const result = await db.oneOrNone(`SELECT id FROM cases WHERE friendly_id = '${params.articleid}'`);
    if(result){
      params.articleid = as.integer(result.id) ; // update the params of articleid = id
    }

    if(Number.isNaN(params.articleid)) {
      return null;
    }
    const articleRow = await db.one(CASE_BY_ID_GET, params);
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

async function getCaseHttp(req, res) {
  /* This is the entry point for getting an article */
  try {
    const params = parseGetParams(req, "case", true);
    const article = await getCaseById(params, res);
    if (!article) {
      res.status(404).render("404");
      return null;
    }
  
    if(!article.published){
      if(req.user && !req.user.isadmin && req.user.id !== article.creator.user_id){
        return res.status(404).render("waiting-for-approval");
      }
    }
  
    const staticText = await getEditStaticText(params);
    returnByType(res, params, article, staticText, req.user);
    
  } catch (error) {
    console.log("error getCaseHttp @@@@@@@@@@@@@@@@ getCaseHttp error", error);
    return res.status(404).render("404");
  }
}

async function getEditStaticText(params) {
  const lang = params.lang;
  const cases = listCases(lang);
  const methods = listMethods(lang);
  const organizations = listOrganizations(lang);
  let staticText = Object.assign({}, sharedFieldOptions);

  staticText.collections = await getCollections(lang);
  staticText.authors = listUsers();
  staticText.cases = Array.isArray(cases)
    ? cases.filter(article => !article.hidden)
    : [];
  staticText.methods = Array.isArray(methods)
    ? methods.filter(article => !article.hidden)
    : [];
  staticText.organizations = Array.isArray(organizations)
    ? organizations.filter(article => !article.hidden)
    : [];
  return staticText;
}

async function getCaseEditHttp(req, res) {
  const params = parseGetParams(req, "case");
  params.view = "edit";
  thingCaseid = null;
  const articles = await getThingEdit(params, CASES_LOCALE_BY_ID, res);
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

async function getCaseNewHttp(req, res) {
  const params = parseGetParams(req, "case");
  params.view = "edit";
  const article = CASE_STRUCTURE;
  thingCaseid = null;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

async function saveCaseDraft(req, res, entry = undefined) {
  const args = {
    LOCALIZED_TEXT_BY_ID_LOCALE,
    UPDATE_DRAFT_LOCALIZED_TEXT,
    INSERT_LOCALIZED_TEXT,
    INSERT_AUTHOR,
    UPDATE_AUTHOR_FIRST,
    UPDATE_ENTRY: UPDATE_CASE,
    CREATE_ENTRY_QUERY: CREATE_CASE,
    refreshSearch,
    thingId: req.body.entryId,
    getUpdatedEntry: getUpdatedCase,
    getEntry: getCase,
    entryType: "case",
  };
  const { payload, thingId } = await saveDraft(req, res, args);
  thingCaseid = req.body.entryId;
  res.status(200).json(payload);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getCaseEditHttp);
router.get("/new", requireAuthenticatedUser(), getCaseNewHttp);
router.post(
  "/new",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postCaseNewHttp
);
router.get("/:thingid/:language?", setAndValidateLanguage(), getCaseHttp);
router.post(
  "/:thingid",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postCaseUpdateHttp
);
router.post(
  "/:thingid/preview",
  requireAuthenticatedUser(),
  isPostOrPutUser(),
  postCaseUpdatePreview
);
router.post("/new/saveDraft", requireAuthenticatedUser(), saveCaseDraft);
router.post("/:thingid/saveDraft", requireAuthenticatedUser(), saveCaseDraft);
router.post(
  "/:thingid/saveDraftPreview",
  requireAuthenticatedUser(),
  saveCaseDraft
);

module.exports = {
  case_: router,
  getCaseEditHttp,
  getCaseNewHttp,
  postCaseNewHttp,
  getCaseHttp,
  postCaseUpdateHttp,
  caseUpdate,
  getCase,
  postCaseUpdatePreview,
  saveCaseDraft,
  getUpdatedCase,
};
