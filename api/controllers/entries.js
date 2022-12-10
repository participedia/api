"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
const caseList = require("./case");
let {
  db,
  as,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  ENTRIES_REVIEW_LIST,
  AUTHOR_BY_ENTRY,
  ENTRIES_BY_USER,
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

const logError = require("../helpers/log-error.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

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

  const removeHiddenEntry = async (entryId) => {
    try {
      return await db.none(
        "DELETE FROM things WHERE id = ${entryId}",
        {
          entryId: entryId
        }
      );
    } catch (err) {
      console.log("removeHiddenEntry error - ", err);
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
      await removeHiddenEntry(thingsByUser.id);
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
    await updateUser(author.user_id, currentDate);
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