"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap

let { db, ENTRIES_REVIEW_LIST } = require("../helpers/db");

const {
  searchFiltersFromReq,
  typeFromReq,
  offsetFromReq,
} = require("../helpers/things");

const { translateEntry } = require("../helpers/translate-helpers");

const {
  publishHiddenEntry,
  removeEntryThings,
  removeEntryCases,
  removeEntryMethods,
  removeEntryCollections,
  removeEntryOrganizations,
  removeAuthor,
  removeLocalizedText,
  getApprovalUserPost,
  getRejectionUserPost,
  getAuthorByEntry,
} = require("../helpers/entries-helpers");

const {
  setUserAcceptedDate,
  blockUserAuth0,
} = require("../helpers/users-helpers");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

const logError = require("../helpers/log-error.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES;
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

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
  const langQuery = SUPPORTED_LANGUAGES.find(
    element => element.twoLetterCode === "en"
  ).name.toLowerCase();
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

    let data = results;

    // return html template
    const returnType = req.query.returns || "html";
    if (returnType === "html") {
      return res.status(200).render(`review-entries`, { results });
    } else if (returnType === "json") {
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Exception in ", error.message);
    logError(error);
  }
});

router.post("/reject-entry", async function(req, res) {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to perform this action." });
  }

  if (!user.isadmin) {
    return res
      .status(403)
      .json({ error: "You must be an admin to perform this action." });
  }

  let author = await getAuthorByEntry(req.body.entryId);
  if (Object.keys(author).length > 0) {
    let allUserPosts = await getRejectionUserPost(author.user_id);

    for (const allUserPost in allUserPosts) {
      let thingsByUser = allUserPosts[allUserPost];
      // console.log("thingsByUser.id ", JSON.stringify(thingsByUser));
      await removeEntryThings(thingsByUser.id);
      switch (thingsByUser.type) {
        case "case":
          await removeEntryCases(thingsByUser.id);
          break;
        case "method":
          await removeEntryMethods(thingsByUser.id);
          break;
        case "collection":
          await removeEntryCollections(thingsByUser.id);
          break;
        case "organization":
          await removeEntryOrganizations(thingsByUser.id);
          break;
      }
      await removeAuthor(thingsByUser.id);
      await removeLocalizedText(thingsByUser.id);
    }

    let userData = await auth0Client.getUsersByEmail(author.email);
    let blockUserAccess = await blockUserAuth0(userData[0].user_id);

    res.status(200).json({
      OK: true,
    });
  } else {
    res.status(403).json({ error: "No entry found for this user" });
  }
});

router.post("/approve-entry", async function(req, res) {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to perform this action." });
  }

  if (!user.isadmin) {
    return res
      .status(403)
      .json({ error: "You must be an admin to perform this action." });
  }

  let author = await getAuthorByEntry(req.body.entryId);
  if (Object.keys(author).length > 0) {
    const currentDate = new Date();
    let setAcceptedUser = await setUserAcceptedDate(
      author.user_id,
      currentDate
    );
    let translateEntryText = translateEntry(req.body.entryId);
    let allUserPosts = await getApprovalUserPost(author.user_id);

    for (const allUserPost in allUserPosts) {
      let thingsByUser = allUserPosts[allUserPost];
      if (thingsByUser.published) {
        await publishHiddenEntry(thingsByUser.id);
      }
    }

    res.status(200).json({
      OK: true,
    });
  } else {
    res.status(403).json({ error: "No entry found for this user" });
  }
});

module.exports = router;
