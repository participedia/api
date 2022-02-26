"use strict";

const express = require("express");
const cache = require("apicache");
const fs = require("fs");

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
  generateLocaleArticle
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
  try {
    cache.clear();
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
      originalLanguageEntry
    } = parseAndValidateThingPostData(generateLocaleArticle(req.body, req.body.entryLocales), "organization");

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

    // const user_id = req.user.id;
    const thing = await db.one(CREATE_ORGANIZATION, {
      title,
      body,
      description,
      original_language,
    });
    req.params.thingid = thing.thingid;
    // await postOrganizationUpdateHttp(req, res);
    const { article, errors } = await organizationUpdate(req, res, originalLanguageEntry);
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
      await createLocalizedRecord(localizedData, thing.thingid, filteredLocalesToTranslate);
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
  cache.clear();
  const params = parseGetParams(req, "organization");
  // const user = req.user;
  const { articleid } = params;
  const langErrors = [];
  const localeEntries = generateLocaleArticle(req.body, req.body.entryLocales, true);
  let originalLanguageEntry;

  for (const entryLocale in localeEntries) {
    if (req.body.hasOwnProperty(entryLocale)) {
      const entry = localeEntries[entryLocale];
      if (entryLocale === entry.original_language) {
        originalLanguageEntry = entry;
      }
      let errors = validateFields(entry, "organization");
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

  await organizationUpdate(req, res, originalLanguageEntry);
  const localeEntriesArr = [].concat(...Object.values(localeEntries));

  await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
  const freshArticle = await getOrganization(params, res);
  res.status(200).json({
    OK: true,
    article: freshArticle,
  });
  refreshSearch();
}

async function organizationUpdate(req, res, entry = undefined) {
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
  if (isNewOrganization) {
    newOrganization.post_date = Date.now();
  }

  // if this is a new method, we don't have a updated_date yet, so we set it here
  if (isNewOrganization) {
    newOrganization.updated_date = Date.now();
  }

  const {
    updatedText,
    author,
    oldArticle,
  } = await maybeUpdateUserTextLocaleEntry(newOrganization, req, res, "organization"); //maybeUpdateUserText(req, res, "organization");
  const [updatedOrganization, er] = getUpdatedOrganization(
    user,
    params,
    newOrganization,
    oldArticle
  );
  //get current date when user.isAdmin is false;
  updatedOrganization.updated_date = !user.isadmin
    ? "now"
    : updatedOrganization.updated_date;
  author.timestamp = new Date().toJSON().slice(0, 19).replace('T', ' ');
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
          timestamp: new Date(newOrganization.post_date)
        };
        await db.tx("update-organization", async t => {

          if (!isNewOrganization) {

            if (updatedOrganization.verified) {
              updatedOrganization.reviewed_by = creator.user_id;
              updatedOrganization.reviewed_at = "now";
            }

            var userId = updatedOrganization.creator.user_id.toString();
            var creatorTimestamp = new Date(oldArticle.post_date);

            if (userId == creator.user_id && creatorTimestamp.toDateString() === creator.timestamp.toDateString()) {
              await t.none(INSERT_AUTHOR, author);
              updatedOrganization.updated_date = "now";
            } else {
              await t.none(UPDATE_AUTHOR_FIRST, creator);
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
  } {
    newOrganization.collections = updatedOrganization.collections;
  }
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
    "general_issues"
  ].map(key => cond(key, as.organizationkeys));
  // list of {id, type, title}
  ["specific_methods_tools_techniques", "collections"].map(key => cond(key, as.ids));
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
  const staticText = {};
  returnByType(res, params, article, staticText, req.user);
}

async function getOrganizationEditHttp(req, res) {
  const params = parseGetParams(req, "organization");
  params.view = "edit";
  const articles = await getThingEdit(params, ORGANIZATION_LOCALE_BY_ID, res);
  if (!articles) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, articles, staticText, req.user);
}

async function getOrganizationNewHttp(req, res) {
  const params = parseGetParams(req, "organization");
  params.view = "edit";
  const article = ORGANIZATION_STRUCTURE;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getOrganizationEditHttp);
router.get("/new", requireAuthenticatedUser(), getOrganizationNewHttp);
router.post("/new", requireAuthenticatedUser(), isPostOrPutUser(), postOrganizationNewHttp);
router.get("/:thingid/:language?", setAndValidateLanguage(), getOrganizationHttp);
router.post("/:thingid", requireAuthenticatedUser(), isPostOrPutUser(), postOrganizationUpdateHttp);

module.exports = {
  organization: router,
  postOrganizationNewHttp,
  postOrganizationUpdateHttp,
  getOrganizationHttp,
  getOrganizationEditHttp,
  getOrganizationNewHttp,
};
