"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let log = require("winston");
let { db, as, USER_BY_ID, UPDATE_USER } = require("../helpers/db");
const staticTextToBeAdded = require("../locales/en.js");
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

async function getStaticText(language) {
  // merge localized text from the db with the keys that need to be added.
  const staticTextFromDB = await db.one(
    `select * from layout_localized where language = '${language}';`
  );
  return Object.assign({}, staticTextToBeAdded, staticTextFromDB);
}

async function getUserById(userId, req, res, view = "view") {
  try {
    const language = req.params.language || "en";

    const result = await db.oneOrNone(USER_BY_ID, {
      userId: userId,
      language: language
    });
    if (!result) {
      return res
        .status(404)
        .json({ OK: false, error: `User not found for user_id ${userId}` });
    }

    // if name contains @, assume it's an email address, and strip the domain
    // so we are not sharing email address' publicly
    const atSymbolIndex = result.user.name.indexOf("@");
    if (atSymbolIndex > 0) {
      result.user.name = result.user.name.substr(0, atSymbolIndex);
    }

    const staticText = await getStaticText(language);

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
        "join_date"
      ];
      const userEditJSON = {};
      userEditKeys.forEach(key => (userEditJSON[key] = result.user[key]));

      return {
        static: staticText,
        profile: userEditJSON
      };
    } else {
      return {
        static: staticText,
        profile: result.user
      };
    }
  } catch (error) {
    log.error("Exception in GET /user/%s => %s", userId, error);
    console.trace(error);
    if (error.message && error.message == "No data returned from the query.") {
      res.status(404).json({ OK: false });
    } else {
      res.status(500).json({ OK: false, error: error });
    }
  }
}

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
    const data = await getUserById(req.params.userId, req, res, "view");

    // return html template
    const returnType = req.query.returns || "html";
    if (returnType === "html") {
      res.status(200).render(`user-view`, data);
    } else if (returnType === "json") {
      res.status(200).json(data);
    }
  } catch (error) {
    console.error("Problem in /user/:userId");
    console.trace(error);
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
    console.error("Problem in /user/:userId/edit");
    console.trace(error);
  }
});

router.get("/", async function(req, res) {
  try {
    if (!req.user) {
      return res.status(404).json({
        message: "No user found"
      });
    }
    return getUserById(req.user.user_id, req, res);
  } catch (error) {
    console.error("Problem in /user/");
    console.trace(error);
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
    return res
      .status(401)
      .json({
        error: "The user doesn't have permission to perform this operation."
      });
  }

  try {
    let user = req.body;

    await db.none(UPDATE_USER, {
      id: parseInt(user.id),
      name: user.name,
      bio: user.bio || ""
    });
    res.status(200).json({ OK: true });
  } catch (error) {
    log.error("Exception in POST /user => %s", error);
    if (error.message && error.message == "No data returned from the query.") {
      res.status(404).json({ OK: false });
    } else {
      res.status(500).json({ OK: false, error: error });
      console.trace(error);
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
