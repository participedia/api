"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
const caseList = require("./case");

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

let {
  db,
  pgp,
  as,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  ENTRIES_REVIEW_LIST,
  AUTHOR_BY_ENTRY,
  ENTRIES_BY_USER,
  LOCALIZED_TEXT_BY_THING_ID,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
  SEARCH_CHINESE,
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
  searchFiltersFromReq,
  typeFromReq,
  offsetFromReq,
  publishDraft
} = require("../helpers/things");

const {
  caseUpdate,
  getCase
} = require("./case");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users update:users'
});


const logError = require("../helpers/log-error.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");
const { getOriginalLanguageEntry } = require("./api/api-helpers");

const queryFileFromReq = req => {
  const featuredOnly =
    !req.query.query || (req.query.query || "").toLowerCase() === "featured";
  const resultType = (req.query.resultType || "").toLowerCase();
  let queryfile = SEARCH;
  if (featuredOnly && resultType === "map") {
    queryfile = FEATURED_MAP;
  } else if (featuredOnly) {
    queryfile = FEATURED;
  } else if (resultType == "map") {
    queryfile = SEARCH_MAP;
  }
  return queryfile;
};

const sortbyFromReq = req => {
  if (req.query.sortby === "post_date") {
    return "post_date";
  }
  return "updated_date";
};


/**
 * @api {get} /review-entries Show all entries that need to be reviewed
 * @apiGroup review-entries
 * @apiVersion 0.1.0
 * @apiName all-review-entries
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {data} User object if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        OK: true
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
 router.get("/review", requireAuthenticatedUser(), async function(req, res) {
    const user_query = req.query.query || "";
    const langQuery = SUPPORTED_LANGUAGES.find(element => element.twoLetterCode === "en").name.toLowerCase();
    const type = typeFromReq(req);

      try {
        let results = await db.any(ENTRIES_REVIEW_LIST, {
          query: user_query,
          limit: null, // null is no limit in SQL
          offset: offsetFromReq(req),
          language: "en",
          langQuery: langQuery,
          userId: req.user ? req.user.id : null,
          sortby: sortbyFromReq(req),
          type: type + "s",
          facets: searchFiltersFromReq(req),
        });
    
        // const data = await getUserById(userId, req, res, "view");
    
        // if (!data) {
        //   return res.status(404).render("404");
        // }
        let data = results;
        // console.log("data review - " + JSON.stringify(results))
    
        // return html template
        const returnType = req.query.returns || "html";
        if (returnType === "html") {
          return res.status(200).render(`review-entries`, {results});
        } else if (returnType === "json") {
          return res.status(200).json(data);
        }
      } catch (error) {
        console.error("Exception in ",  error.message);
        logError(error);
      }
  });

  const updateUser = async (id, currentDate) => {
    try {
      return await db.none(
        "UPDATE users SET accepted_date = ${currentDate} WHERE id = ${id}",
        {
          id: id,
          currentDate: currentDate,
        }
      );
    } catch (err) {
      console.log("updateUser error - ", err);
    }
  }

  const publishHiddenEntry = async (entryId) => {
    try {
      return await db.none(
        "UPDATE things SET hidden = false WHERE id = ${entryId}",
        {
          entryId: entryId
        }
      );
    } catch (err) {
      console.log("publishHiddenEntry error - ", err);
    }
  }

  const removeEntry = async (entryId) => {
    try {
      return await db.none(
        "DELETE FROM things WHERE id = ${entryId}",
        {
          entryId: entryId
        }
      );
    } catch (err) {
      console.log("removeEntry error - ", err);
    }
  }

  const getAllUserPost = async (user_id) => {
    try {
      let results = await db.any(ENTRIES_BY_USER, {
        user_id: user_id,
      });
      return results;
    } catch (err) {
      console.log("getAllUserPost error - ", err);
    }
  }

  const getAuthorByEntry = async (entryId) => {
    try {
      let results = await db.one(AUTHOR_BY_ENTRY, {
        entry_id: entryId,
      });
      return results;
    } catch (err) {
      console.log("updateUser error - ", err);
    }
  }

  const getOriginLanguageEntry = async (thingid) => {
    try {
      let results = await db.one(LOCALIZED_TEXT_BY_THING_ID, {
        thingid: thingid,
      });
      return results;
    } catch (err) {
      console.log("getOriginLanguageEntry error - ", err);
    }
  }

  const translateText = async (data, targetLanguage) => {
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

  const translateEntry = async (entryId) => {
    let languageList = ["en", "fr", "de", "es", "zh", "it", "pt", "nl"];
    let originEntry = await getOriginLanguageEntry(entryId);
    languageList = languageList.filter(el => el !== originEntry.language);
    let records = [];

    for (let i = 0; i < languageList.length; i++) {
      const item = {
        body: "",
        title: "",
        description: "",
        language: languageList[i],
        thingid: entryId,
        timestamp: 'now'
      };
      item.body = await translateText(originEntry.body, languageList[i]);
      item.title = await translateText(originEntry.title, languageList[i]);
      item.description = await translateText(originEntry.description, languageList[i]);

      records.push(item);
    }

    const insert = pgp.helpers.insert(records, ['body', 'title', 'description', 'language', 'thingid', 'timestamp'], 'localized_texts');

    db.none(insert)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(error) {
        console.log(error);
      });

    return originEntry;
  }

  router.post("/reject-entry", async function(req, res) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to perform this action." });
    }
    let author = await getAuthorByEntry(req.body.entryId);
    let allUserPosts = await getAllUserPost(author.user_id);
    for (const allUserPost in allUserPosts) {
      let thingsByUser = allUserPosts[allUserPost];
      await removeEntry(thingsByUser.id);
    };

    res.status(200).json({
      OK: true,
    });
    
  });

  router.post("/approve-entry", async function(req, res) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to perform this action." });
    }
    let author = await getAuthorByEntry(req.body.entryId);
    const currentDate = new Date();
    let setAcceptedUser = await updateUser(author.user_id, currentDate);
    let translateEntryText = await translateEntry(req.body.entryId);
    let allUserPosts = await getAllUserPost(author.user_id);
    for (const allUserPost in allUserPosts) {
      let thingsByUser = allUserPosts[allUserPost];
      if (thingsByUser.published) {
        await publishHiddenEntry(thingsByUser.id);
      }
    };

    res.status(200).json({
      OK: true,
    });

    
  });


module.exports = router;