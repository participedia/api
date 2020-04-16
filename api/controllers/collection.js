"use strict";
const express = require("express");
const cache = require("apicache");
const equals = require("deep-equal");
const fs = require("fs");

const {
  db,
  as,
  CASES_BY_COUNTRY,
  CREATE_CASE,
  COLLECTION_BY_ID,
  INSERT_AUTHOR,
  INSERT_LOCALIZED_TEXT,
  UPDATE_COLLECTION,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  listUsers,
  listCases,
  listMethods,
  listOrganizations,
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
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
// const CASE_STRUCTURE = JSON.parse(
//   fs.readFileSync("api/helpers/data/case-structure.json", "utf8")
// );
const sharedFieldOptions = require("../helpers/shared-field-options.js");

// /**
//  * @api {post} /case/new Create new case
//  * @apiGroup Cases
//  * @apiVersion 0.1.0
//  * @apiName newCase
//  *
//  * @apiSuccess {Boolean} OK true if call was successful
//  * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
//  * @apiSuccess {Object} data case data
//  *
//  * @apiSuccessExample Success-Response:
//  *     HTTP/1.1 200 OK
//  *     {
//  *       "OK": true,
//  *       "data": {
//  *         "ID": 3,
//  *         "Description": 'foo'
//  *        }
//  *     }
//  *
//  * @apiError NotAuthenticated The user is not authenticated
//  * @apiError NotAuthorized The user doesn't have permission to perform this operation.
//  *
//  */

// async function postCaseNewHttp(req, res) {
//   // create new `case` in db
//   try {
//     cache.clear();
//     let title = req.body.title;
//     let body = req.body.body || req.body.summary || "";
//     let description = req.body.description;
//     let original_language = req.body.original_language || "en";
//     let links = req.body.links;

//     if (!title) {
//       return res.status(400).json({
//         OK: false,
//         errors: ["Cannot create a case without at least a title."],
//       });
//     }

//     const user_id = req.user.id;
//     const thing = await db.one(CREATE_CASE, {
//       title,
//       body,
//       description,
//       original_language,
//     });
//     req.params.thingid = thing.thingid;
//     await postCollectionUpdateHttp(req, res);
//   } catch (error) {
//     logError(error);
//     res.status(400).json({ OK: false, error: error });
//   }
// }

// /**
//  * @api {put} /case/:caseId  Submit a new version of a case
//  * @apiGroup Cases
//  * @apiVersion 0.1.0
//  * @apiName editCase
//  * @apiParam {Number} caseId Case ID
//  *
//  * @apiSuccess {Boolean} OK true if call was successful
//  * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
//  * @apiSuccess {Object} data case data
//  *
//  * @apiSuccessExample Success-Response:
//  *     HTTP/1.1 200 OK
//  *     {
//  *       "OK": true,
//  *       "data": {
//  *         "ID": 3,
//  *         "Description": 'foo'
//  *        }
//  *     }
//  *
//  * @apiError NotAuthenticated The user is not authenticated
//  * @apiError NotAuthorized The user doesn't have permission to perform this operation.
//  *
//  */

function getUpdatedCollection(user, params, newCollection, oldCollection) {
  const updatedCollection = Object.assign({}, oldCollection);
  const er = new ErrorReporter();
  const cond = (key, fn) => setConditional(updatedCollection, newCollection, er, fn, key);
  // admin-only
  if (user.isadmin) {
    cond("featured", as.boolean);
    cond("hidden", as.boolean);
    cond("original_language", as.text);
    cond("post_date", as.date);
    cond("updated_date", as.date);
  }

  // media lists
  ["links", "videos", "audio", "evaluation_links"].map(key =>
    cond(key, as.media)
  );
  // photos and files are slightly different from other media as they have a source url too
  ["photos", "files"].map(key =>
    cond(key, as.sourcedMedia)
  );
  // TODO save bookmarked on user
  return [updatedCollection, er];
}

// // Only changes to title, description, and/or body trigger a new author and version

async function postCollectionUpdateHttp(req, res) {
  cache.clear();
  const params = parseGetParams(req, "collection");
  const user = req.user;
  const { articleid, type, view, userid, lang, returns } = params;
  const newCollection = req.body;
  const links = req.body.links;

  //validate url

  if (links) {
    for (let key in links) {
      let url = links[key].url;
      if (url.length > 0) {
        newCollection.links = verifyOrUpdateUrl(newCollection.links);
        const isUrlValid = validateUrl(newCollection);
        if (!isUrlValid) {
          return res.status(400).json({
            OK: false,
            errors: ["Invalid link url."],
          });
        }
      }
    }
  }

  // if this is a new case, we don't have a post_date yet, so we set it here
  if (!newCollection.post_date) {
    newCollection.post_date = Date.now();
  }

  // if this is a new case, we don't have a updated_date yet, so we set it here
  if (!newCollection.updated_date) {
    newCollection.updated_date = Date.now();
  }

  // save any changes to the user-submitted text
  const {
    updatedText,
    author,
    oldArticle: oldCollection,
  } = await maybeUpdateUserText(req, res, "collection");
  const [updatedCollection, er] = getUpdatedCollection(user, params, newCollection, oldCollection);

  //get current date when user.isAdmin is false;
  updatedCollection.updated_date = !user.isadmin ? "now" : updatedCollection.updated_date;

  if (!er.hasErrors()) {
    if (updatedText) {
      await db.tx("update-collection", async t => {
        await t.none(INSERT_AUTHOR, author);
        await t.none(INSERT_LOCALIZED_TEXT, updatedText);
        await t.none(UPDATE_COLLECTION, updatedCollection);
      });
      //if this is a new case, set creator id to userid and isAdmin
      if (user.isadmin) {
        const creator = {
          user_id: newCollection.creator ? newCollection.creator : params.userid,
          thingid: params.articleid,
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
    res.status(200).json({
      OK: true,
      article: freshArticle,
    });
    refreshSearch();
  } else {
    logError(`400 with errors: ${er.errors.join(", ")}`);
    res.status(400).json({
      OK: false,
      errors: er.errors,
    });
  }
}

// /**
//  * @api {get} /case/:thingid Get the last version of a case
//  * @apiGroup Cases
//  * @apiVersion 0.1.0
//  * @apiName returnCaseById
//  * @apiParam {Number} thingid Case ID
//  *
//  * @apiSuccess {Boolean} OK true if call was successful
//  * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
//  * @apiSuccess {Object} data case data
//  *
//  * @apiSuccessExample Success-Response:
//  *     HTTP/1.1 200 OK
//  *     {
//  *       "OK": true,
//  *       "data": {
//  *         "ID": 3,
//  *         "Description": 'foo'
//  *        }
//  *     }
//  *
//  * @apiError NotAuthenticated The user is not authenticated
//  * @apiError NotAuthorized The user doesn't have permission to perform this operation.
//  *
//  */

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
  const article = await getCollection(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

async function getEditStaticText(params) {
  const lang = params.lang;
  let staticText = Object.assign({}, sharedFieldOptions);
  staticText.authors = listUsers();
  staticText.cases = listCases(lang).filter(article => !article.hidden);
  staticText.methods = listMethods(lang).filter(article => !article.hidden);
  staticText.organizations = listOrganizations(lang).filter(
    article => !article.hidden
  );
  return staticText;
}

async function getCollectionEditHttp(req, res) {
  let startTime = new Date();
  const params = parseGetParams(req, "case");
  params.view = "edit";
  const article = await getCollection(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

// async function getCaseNewHttp(req, res) {
//   const params = parseGetParams(req, "case");
//   params.view = "edit";
//   const article = CASE_STRUCTURE;
//   const staticText = await getEditStaticText(params);
//   returnByType(res, params, article, staticText, req.user);
// }

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getCollectionEditHttp);
// router.get("/new", requireAuthenticatedUser(), getCaseNewHttp);
// router.post("/new", requireAuthenticatedUser(), postCaseNewHttp);
router.get("/:thingid", getCollectionHttp);
router.post("/:thingid", requireAuthenticatedUser(), postCollectionUpdateHttp);

module.exports = {
  collection_: router,
  getCollectionEditHttp,
  // getCaseNewHttp,
  // postCaseNewHttp,
  getCollectionHttp,
  postCollectionUpdateHttp,
};
