"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap

let { db, ENTRIES_REVIEW_LIST, UPDATE_CASE, INSERT_AUTHOR, CASE_BY_ID_GET, DELETE_EDITED_CASE_ENTRY, METHOD_BY_ID, UPDATE_METHOD, DELETE_EDITED_METHODS_ENTRY, ORGANIZATION_BY_ID, UPDATE_ORGANIZATION, DELETE_EDITED_ORGANIZATION_ENTRY, STATE_CHARTS_DATA } = require("../helpers/db");

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

      if(req.query.selectedCategory && req.query.selectedCategory === 'review-edits'){
        results = results.filter(item => item.orginal_entry_id);
      } else {
        results = results.filter(item => !item.orginal_entry_id);
      }
      
      return res.status(200).render(`review-entries`, { results, req });
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

    try {
      // let users = await auth0Client.getUsersByEmail(author.email);
      let response = await auth0Client.usersByEmail.getByEmail({email: author.email});
      let users = Array.isArray(response.data) ? response.data : []; 
      if (users && users.length > 0) {
        let blockUserAccess = await blockUserAuth0(users[0].user_id);
      }
    } catch (error) {
      console.log("reject-entry error ", error);
    }

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


function moveUncategorizedLast(arr, uncategorizedLabel = "Uncategorized") {
  const uncategorized = arr.filter(item => item.issue === uncategorizedLabel || item.scope_of_influence === "Etc." || item.method_type === uncategorizedLabel);
  const categorized = arr.filter(item => !(item.issue === uncategorizedLabel || item.scope_of_influence === "Etc." || item.method_type === uncategorizedLabel));
  return [...categorized, ...uncategorized];
}

router.get("/charts", async (req, res, next) => {
  try {
    const type = typeFromReq(req);
    const chartConfig = {
      case: {
        table: "cases",
        scopeExpr: `
          ARRAY[
            COALESCE(NULLIF(scope_of_influence, ''), 'uncategorized')
          ]::text[]
        `,
        issueExpr: `
          CASE
            WHEN general_issues IS NULL OR COALESCE(array_length(general_issues, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE general_issues
          END::text[]
        `,
        methodExpr: `
          CASE
            WHEN method_types IS NULL OR COALESCE(array_length(method_types, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE method_types
          END::text[]
        `,
        issueI18nKey: "general_issues",
        methodI18nKey: "method_types",
      },
      method: {
        table: "methods",
        scopeExpr: `
          CASE
            WHEN scope_of_influence IS NULL OR COALESCE(array_length(scope_of_influence, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE scope_of_influence
          END::text[]
        `,
        issueExpr: `
          CASE
            WHEN purpose_method IS NULL OR COALESCE(array_length(purpose_method, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE purpose_method
          END::text[]
        `,
        methodExpr: `
          CASE
            WHEN method_types IS NULL OR COALESCE(array_length(method_types, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE method_types
          END::text[]
        `,
        issueI18nKey: "purposes",
        methodI18nKey: "method_types",
      },
      organization: {
        table: "organizations",
        scopeExpr: `
          CASE
            WHEN scope_of_influence IS NULL OR COALESCE(array_length(scope_of_influence, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE scope_of_influence
          END::text[]
        `,
        issueExpr: `
          CASE
            WHEN general_issues IS NULL OR COALESCE(array_length(general_issues, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE general_issues
          END::text[]
        `,
        methodExpr: `
          CASE
            WHEN type_method IS NULL OR COALESCE(array_length(type_method, 1), 0) = 0
              THEN ARRAY['uncategorized']::text[]
            ELSE type_method
          END::text[]
        `,
        issueI18nKey: "general_issues",
        methodI18nKey: "type_method",
      },
    };

    const { table, scopeExpr, issueExpr, methodExpr, issueI18nKey, methodI18nKey } =
      chartConfig[type] || chartConfig.case;

    const facets = searchFiltersFromReq(req) || "";
    const rows = await db.any(STATE_CHARTS_DATA, {
      facets: facets,
      table: table,
      scopeExpr: scopeExpr,
      issueExpr: issueExpr,
      methodExpr: methodExpr,
    });
    const i18n = res.__;

    // map & localize (scope + issue + method_type)
    const combined = rows.map(r => {
      const isScopeUncat = r.scope_of_influence === "uncategorized";
      const scopeLabel = isScopeUncat
        ? "Etc."
        : i18n(`name:scope_of_influence-key:${r.scope_of_influence}`);

      const issueKey = r.issue_key;
      const isIssueUncat = issueKey === "uncategorized";
      const issueLabel = isIssueUncat
        ? "Uncategorized"
        : i18n(`name:${issueI18nKey}-key:${issueKey}`);

      const methodKey = r.method_type_key;
      const isMethodUncat = methodKey === "uncategorized";
      const methodLabel = isMethodUncat
        ? "Uncategorized"
        : i18n(`name:${methodI18nKey}-key:${methodKey}`);

      return {
        scope_of_influence: scopeLabel,
        key_scope: !isScopeUncat ? r.scope_of_influence : null,
        issue: issueLabel,
        key_issue: !isIssueUncat ? issueKey : null,
        method_type: methodLabel,
        key_method_type: !isMethodUncat ? methodKey : null,
        count: +r.count,
      };
    });

    // aggregates for visuals
    const generalMap = new Map(); // by issue
    const scopeMap   = new Map(); // by scope_of_influence
    const methodMap  = new Map(); // by method_type

    combined.forEach(({ issue, key_issue, scope_of_influence, key_scope, method_type, key_method_type, count }) => {
      if (!generalMap.has(issue)) {
        generalMap.set(issue, { issue, key: key_issue, count: 0 });
      }
      generalMap.get(issue).count += count;

      if (!scopeMap.has(scope_of_influence)) {
        scopeMap.set(scope_of_influence, { scope_of_influence, key: key_scope, count: 0 });
      }
      scopeMap.get(scope_of_influence).count += count;

      if (!methodMap.has(method_type)) {
        methodMap.set(method_type, { method_type, key: key_method_type, count: 0 });
      }
      methodMap.get(method_type).count += count;
    });

    // Move uncategorized to last
    const generalIssues    = moveUncategorizedLast(Array.from(generalMap.values()), "Uncategorized");
    const scopeOfInfluence = moveUncategorizedLast(Array.from(scopeMap.values()), "Etc.");
    const methodTypes      = moveUncategorizedLast(Array.from(methodMap.values()), "Uncategorized");


    res.json({
      generalIssues,
      scopeOfInfluence,
      methodTypes,
      combined
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
