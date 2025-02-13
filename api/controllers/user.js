"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let { db, as, USER_BY_ID, UPDATE_USER, LIST_USER } = require("../helpers/db");
let { fixUpURLs, placeHolderPhotos } = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

const {
  removeEntryThings,
  removeEntryCases,
  removeEntryMethods,
  removeEntryCollections,
  removeEntryOrganizations,
  removeAuthor,
  removeLocalizedText,
  getRejectionUserPost,
  removeAuthorByUserId,
} = require("../helpers/entries-helpers");

const {
  blockUserAuth0,
  deleteUser,
} = require("../helpers/users-helpers");

const ManagementClient = require("auth0").ManagementClient;

const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users update:users",
});

const getUserById = async (userId, req, res, view = "view") => {
  try {
    const language = req.cookies.locale || "en";
    if (Number.isNaN(userId)) {
      return res.status(404).render("404");
    }
    const result = await db.oneOrNone(USER_BY_ID, {
      userId: userId,
      language: language,
    });
    if (!result) {
      return null;
    }
    result.user.bookmarks.forEach(fixUpURLs);
    result.user.cases.forEach(fixUpURLs);
    result.user.methods.forEach(fixUpURLs);
    result.user.organizations.forEach(fixUpURLs);

    //if i added the placeholder on the fixUpURLs function it will have placeholder image also on the view case, methods, and organization
    result.user.cases.forEach(placeHolderPhotos);
    result.user.methods.forEach(placeHolderPhotos);
    result.user.organizations.forEach(placeHolderPhotos);

    // if (result.user.bookmarks) {
    //   result.user.bookmarks.forEach(b => (b.bookmarked = true));
    // }

    // if name contains @, assume it's an email address, and strip the domain
    // so we are not sharing email address' publicly
    const atSymbolIndex = result.user.name.indexOf("@");
    if (atSymbolIndex > 0) {
      result.user.name = result.user.name.substr(0, atSymbolIndex);
    }

    if (view === "edit") {
      // only return some keys on the user object for the edit view
      const userEditKeys = [
        "id",
        "hidden",
        "name",
        "email",
        "location",
        "language",
        "login",
        "picture_url",
        "bio",
        "isadmin",
        "join_date",
      ];
      const userEditJSON = {};
      userEditKeys.forEach(key => (userEditJSON[key] = result.user[key]));

      return {
        profile: userEditJSON,
      };
    } else {
      return {
        profile: result.user,
      };
    }
  } catch (error) {
    if (error.message && error.message == "No data returned from the query.") {
      return res.status(404).render("404");
    } else {
      logError(error);
      return res.status(500).json({ OK: false, error: error });
    }
  }
};

router.get("/review", requireAuthenticatedUser(), async function(req, res) {

  if (!req.user.isadmin) {
    res.status(404).render("404");
    return null;
  }

  try {
    let results = await db.any(LIST_USER);

    let data = results;

    // return html template
    const returnType = req.query.returns || "html";
    if (returnType === "html") {
      return res.status(200).render(`user-list`, { results });
    } else if (returnType === "json") {
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Exception in ", error.message);
    logError(error);
  }
});

router.post("/delete-user", async function(req, res) {
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

  let author = req.body.userId;
  let userEmail = req.body.userEmail;

  try {
    let allUserPosts = await getRejectionUserPost(author);
    if (Object.keys(allUserPosts).length > 0) {
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
    }
    await removeAuthorByUserId(author)
    await deleteUser(author);
    // let users = await auth0Client.getUsersByEmail(userEmail);
    let response = await auth0Client.usersByEmail.getByEmail({email: userEmail});
    let users = Array.isArray(response.data) ? response.data : []; 
    if (users && users.length > 0) {
      let blockUserAccess = await blockUserAuth0(users[0].user_id);
    }

    res.status(200).json({
      OK: true,
    });
  } catch (error) {
    console.log("delete-user error - ", error);
    res.status(403).json({ error: "Delete user is failed" });
  }
});

// delete users
router.post("/delete-users", async function(req, res) {
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

    let authors = req.body.authors;
    if (authors && Array.isArray(authors) && authors.length > 0) {
      for (const authorIndex in authors) {
        let authorData = authors[authorIndex];
        let author = authorData.userId;
        let userEmail = authorData.email;
        let allUserPosts = await getRejectionUserPost(author);
        if (Object.keys(allUserPosts).length > 0) {
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
        }
        await removeAuthorByUserId(author)
        await deleteUser(author);
        // let userData = await auth0Client.getUsersByEmail(userEmail);
        let response = await auth0Client.usersByEmail.getByEmail({email: userEmail});
        let users = Array.isArray(response.data) ? response.data : []; 
        if (users && users.length > 0) {
          let blockUserAccess = await blockUserAuth0(userData[0].user_id);
        }
        
      }
    }

    res.status(200).json({
      OK: true,
    });
  } catch (error) {
    console.log("delete-users error - ", error);
    res.status(403).json({ error: "Delete user is failed" });
  }
});

/**
 * @api {get} /user/:userId Retrieve a user
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName getUserById
 * @apiParam {Number} userId user ID
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
router.get("/:userId", async function(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) {
      return res.status(404).render("404");
    }

    const data = await getUserById(userId, req, res, "view");

    if (!data) {
      return res.status(404).render("404");
    }

    // return html template
    const returnType = req.query.returns || "html";
    if (returnType === "html") {
      return res.status(200).render(`user-view`, data);
    } else if (returnType === "json") {
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Exception in /user/%s => %s", userId, error.message);
    logError(error);
    res.status(404).render("404");
  }
});

router.get("/:userId/edit", requireAuthenticatedUser(), async function(
  req,
  res
) {
  // if user is not owner of this profile, redirect to profile view
  if (req.user.id !== parseInt(req.params.userId)) {
    return res.redirect(`/user/${req.params.userId}`);
  }

  try {
    const data = await getUserById(req.params.userId, req, res, "edit");
    // return html template
    res.status(200).render(`user-edit`, data);
  } catch (error) {
    console.error(
      "Exception in in /user/%s/edit => %s",
      req.params.userId,
      error.message
    );
    logError(error);
  }
});

router.get("/", async function(req, res) {
  try {
    if (!req.user) {
      return res.status(404).json({
        message: "No user found",
      });
    }
    return getUserById(req.user.user_id, req, res);
  } catch (error) {
    logError(error);
    res.status(404).render("404");
  }
});

/**
 * @api {post} /user Update a user's own profile
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName getUserById
 * @apiParam {Number} userId user ID
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
router.post("/", async function(req, res) {
  // make sure we have a logged in user
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to perform this action." });
  }

  // make sure profile is logged in user's profile
  if (req.user.id !== parseInt(req.body.id)) {
    return res.status(401).json({
      error: "The user doesn't have permission to perform this operation.",
    });
  }

  try {
    let user = req.body;

    await db.none(UPDATE_USER, {
      id: parseInt(user.id),
      name: user.name,
      bio: user.bio || "",
    });
    res.status(200).json({ OK: true, user: { id: user.id } });
  } catch (error) {
    if (error.message && error.message == "No data returned from the query.") {
      res.status(404).json({ OK: false });
    } else {
      logError(error);
      res.status(500).json({ OK: false, error: error });
    }
  }
});

/**
 * @api {delete} /user/:userId Delete a user
 * @apiGroup users
 * @apiVersion 0.1.0
 * @apiName deleteuser
 * @apiParam {Number} userId user ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
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

router.delete("/:userId", function edituserById(req, res) {
  cache.clear();
  // let userId = req.swagger.params.userId.value;
  // let userBody = req.body;
  res.status(200).json(req.body);
});

module.exports = router;
