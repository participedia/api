"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap

let { db, ENTRIES_REVIEW_LIST, UPDATE_CASE, INSERT_AUTHOR, CASE_BY_ID_GET, DELETE_EDITED_CASE_ENTRY, METHOD_BY_ID, UPDATE_METHOD, DELETE_EDITED_METHODS_ENTRY, ORGANIZATION_BY_ID, UPDATE_ORGANIZATION, DELETE_EDITED_ORGANIZATION_ENTRY } = require("../helpers/db");

const {
  searchFiltersFromReq,
  typeFromReq,
  offsetFromReq,
  applyLocalizedTextChangesToOrgin,
} = require("../helpers/things");

const { processTranslateEntry } = require("../helpers/translate-helpers");

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
  getEntryOriginLang,
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
const { getUpdatedCase } = require("./case");
const { getUpdatedMethod } = require("./method");
const { getUpdatedOrganization } = require("./organization");

const sortbyFromReq = req => {
  if (req.query.sortby === "post_date") {
    return "post_date";
  }
  return "updated_date";
};

const processEntryChanges = async (type, editedEntryId, orginalEntryId, userId, lang) => {
  try {
    const author = {
      user_id: userId,
      timestamp: "now",
      thingid: orginalEntryId,
    };

    if(type == 'case'){ // case
      // case changes
      const orginalArticleRow = await db.one(CASE_BY_ID_GET, {
        articleid: orginalEntryId,
        userid: userId,
        lang: lang
      });
      const orginalEntry = orginalArticleRow.results;
      if(!orginalEntry){
        return;
      }
      const editedArticleRow = await db.one(CASE_BY_ID_GET, {
        articleid: editedEntryId,
        userid: userId,
        lang: lang
      });
      const editedEntry = editedArticleRow.results;
      const [updatedCase] = getUpdatedCase({isadmin: false}, {}, editedEntry, orginalEntry);
      const isIntegerList = ["is_component_of", "number_of_participants", "primary_organizer", "collections", "latitude", "longitude"];
      for (const key in updatedCase) {
        if (isIntegerList.includes(key)) {
          if (isNaN(updatedCase[key])) {
            updatedCase[key] = null;
          }
        }
      }
      updatedCase.hidden = false;
      await db.none(UPDATE_CASE, updatedCase);
      // await db.none(INSERT_AUTHOR, author);

      // delete non need records 
      await db.any(DELETE_EDITED_CASE_ENTRY, {thingid: editedEntryId})

    } else if(type === 'method'){ //method 
      // method changes
      const orginalArticleRow = await db.one(METHOD_BY_ID, {
        articleid: orginalEntryId,
        userid: userId,
        lang: lang
      });
      const orginalEntry = orginalArticleRow.results;
      if(!orginalEntry){
        return;
      }
      const editedArticleRow = await db.one(METHOD_BY_ID, {
        articleid: editedEntryId,
        userid: userId,
        lang: lang
      });
      const editedEntry = editedArticleRow.results;
      const [updatedMethod] = getUpdatedMethod({isadmin: false}, {}, editedEntry, orginalEntry);
      if(isNaN(updatedMethod.number_of_participants)) {
        updatedMethod.number_of_participants = null;
      }
      updatedMethod.hidden = false;
      await db.none(UPDATE_METHOD, updatedMethod);
      // await db.none(INSERT_AUTHOR, author);
      // delete non need records on methods
      await db.any(DELETE_EDITED_METHODS_ENTRY, {thingid: editedEntryId})

    } else if(type === 'organization'){ // organization
      // organization changes
      const orginalArticleRow = await db.one(ORGANIZATION_BY_ID, {
        articleid: orginalEntryId,
        userid: userId,
        lang: lang
      });
      const orginalEntry = orginalArticleRow.results;
      if(!orginalEntry){
        return;
      }
      const editedArticleRow = await db.one(ORGANIZATION_BY_ID, {
        articleid: editedEntryId,
        userid: userId,
        lang: lang
      });
      const editedEntry = editedArticleRow.results;
      const [updatedOrganization] = getUpdatedOrganization({isadmin: false}, {}, editedEntry, orginalEntry);
      if (isNaN(updatedOrganization.number_of_participants)) {
        updatedOrganization.number_of_participants = null;
      }
      updatedOrganization.hidden = false;
      await db.none(UPDATE_ORGANIZATION, updatedOrganization);
      // await db.none(INSERT_AUTHOR, author);
      // delete non need records 
      await db.any(DELETE_EDITED_ORGANIZATION_ENTRY, {thingid: editedEntryId})

    }
  } catch (error) {
    throw error;
  }
}

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

  if (!req.user.isadmin) {
    res.status(404).render("404");
    return null;
  }
  
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
      post_date: "2023-08-01",
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

  if (!req.user.isadmin) {
    return res
      .status(403)
      .json({ error: "You must be an admin to perform this action." });
  }

  let author = await getAuthorByEntry(req.body.entryId);
  if (Object.keys(author).length > 0) {
    let allUserPosts = await getRejectionUserPost(author.user_id);

    for (const allUserPost in allUserPosts) {
      let thingsByUser = allUserPosts[allUserPost];
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

  if (!req.user.isadmin) {
    return res
      .status(403)
      .json({ error: "You must be an admin to perform this action." });
  }

  try {
    let entryId = req.body.entryId;
    let author = await getAuthorByEntry(entryId);
    let entryData = await getEntryOriginLang(entryId);
    // check if the entry is an editing version from non approved user
    if(entryData.orginal_entry_id){
      await applyLocalizedTextChangesToOrgin(entryId, entryData.orginal_entry_id, author.user_id) // copy changes to orginal entry
      await processEntryChanges(entryData.type, entryId, entryData.orginal_entry_id, author.user_id, entryData.original_language)//process edited entry from non approved user
  
      // then follow up, with the orginal entry
      entryId = entryData.orginal_entry_id; // assign the orginal id
      entryData = await getEntryOriginLang(entryId); // get the orginal entry | Not the entry editing from non approved user
    }
  
    if (Object.keys(author).length > 0) {
      const currentDate = new Date();
      let setAcceptedUser = await setUserAcceptedDate(
        author.user_id,
        currentDate
      );
      // let translateEntryText = translateEntry(entryId, entryData.original_language);
      let translateEntryText = processTranslateEntry(entryId, entryData.original_language);
      let allUserPosts = await getApprovalUserPost(author.user_id);
  
      for (const allUserPost in allUserPosts) {
        let thingsByUser = allUserPosts[allUserPost];
        if(thingsByUser.hidden && thingsByUser.orginal_entry_id){
          await applyLocalizedTextChangesToOrgin(thingsByUser.id, thingsByUser.orginal_entry_id, thingsByUser.user_id) // copy changes to orginal entry
          await processEntryChanges(thingsByUser.type, thingsByUser.id, thingsByUser.orginal_entry_id, thingsByUser.user_id, thingsByUser.original_language)//process edited entry from non approved user
        } else if (thingsByUser.hidden) {
          publishHiddenEntry(thingsByUser.id);
        }
      }
  
      res.status(200).json({
        OK: true,
      });
    } else {
      res.status(403).json({ error: "No entry found for this user" });
    }
  } catch (error) {
    res.status(403).json({ error: error.message});
  }

});

module.exports = router;
