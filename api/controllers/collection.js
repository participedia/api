"use strict";
const express = require("express");
const cache = require("apicache");
const fs = require("fs");

const {
  db,
  as,
  CREATE_COLLECTION,
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
  offsetFromReq,
  createUntranslatedLocalizedRecords,
  maybeUpdateUserTextLocaleEntry
} = require("../helpers/things");

const logError = require("../helpers/log-error.js");
const { RESPONSE_LIMIT } = require("./../../constants.js");
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const COLLECTION_STRUCTURE = JSON.parse(
  fs.readFileSync("api/helpers/data/collection-structure.json", "utf8")
);

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
  try {
    cache.clear();
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
    const {article, errors} = await postCollectionUpdateHttp(req, res, originalLanguageEntry);

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

async function postCollectionUpdateHttp(req, res, entry = undefined) {
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

  //get current date when user.isAdmin is false;
  updatedCollection.updated_date = !user.isadmin
    ? "now"
    : updatedCollection.updated_date;

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
  const article = await getCollection(params, res, req);
  const type = typeFromReq(req);
  const limit = limitFromReq(req);
  const offset = offsetFromReq(req);
  const types = getTypes(params);
  const articleid = params.articleid;
  const facets = `AND collections @> ARRAY[${articleid}]`;

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

  if (!article) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(
    res,
    params,
    article,
    staticText,
    req.user,
    results,
    total,
    pages,
    numArticlesByType
  );
}

async function getEditStaticText(params) {
  let staticText = {};
  return staticText;
}

async function getCollectionEditHttp(req, res) {
  const params = parseGetParams(req, "collection");
  params.view = "edit";
  const article = await getCollection(params, res);
  if (!article) {
    res.status(404).render("404");
    return null;
  }
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

async function getCollectionNewHttp(req, res) {
  const params = parseGetParams(req, "collection");
  params.view = "edit";
  const article = COLLECTION_STRUCTURE;
  const staticText = await getEditStaticText(params);
  returnByType(res, params, article, staticText, req.user);
}

const router = express.Router(); // eslint-disable-line new-cap
router.get("/:thingid/edit", requireAuthenticatedUser(), getCollectionEditHttp);
router.get("/new", requireAuthenticatedUser(), getCollectionNewHttp);
router.post("/new", requireAuthenticatedUser(), postCollectionNewHttp);
router.get("/:thingid", getCollectionHttp);
router.post("/:thingid", requireAuthenticatedUser(), postCollectionUpdateHttp);

module.exports = {
  collection_: router,
  getCollectionEditHttp,
  getCollectionNewHttp,
  postCollectionNewHttp,
  getCollectionHttp,
  postCollectionUpdateHttp,
};
