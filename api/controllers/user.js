"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
let log = require("winston");
let { db, as, USER_BY_ID, UPDATE_USER } = require("../helpers/db");

async function getUserById(userId, req, res, view="view") {
  try {
    const result = await db.oneOrNone(USER_BY_ID, {
      userId: userId,
      language: req.params.language || "en"
    });
    if (!result) {
      return res
        .status(404)
        .json({ OK: false, error: `User not found for user_id ${userId}` });
    }

    const userJSON = {
      "id": 417689,
      "hidden": null,
      "name": "Alanna Scott",
      "email": "alanna.scott@gmail.com",
      "location": "Victoria, BC, Canada",
      "language": "en",
      "login": true,
      "join_date": "2018-11-20T21:51:09.734",
      "picture_url": "https://s.gravatar.com/avatar/d87986e91d456dfd25bdd9545d7cb51f?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fal.png",
      "bio": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sagittis justo id fermentum auctor. Aliquam iaculis mauris quis tempor viverra. Etiam commodo porta erat, sit amet ullamcorper augue. Quisque quam felis, vehicula ut efficitur at, sodales eu lacus. Nam mattis mauris sit amet lectus semper hendrerit. Morbi laoreet turpis ac enim vulputate, at condimentum lorem fringilla. Praesent quis justo ipsum. Ut at odio et enim tempor aliquet et et felis. Mauris quis ligula quis sem auctor egestas. Nullam quis tellus leo.",
      "isadmin": false,
      "type": "user",
      "articles": {
        "totalResults": 3,
        "totalPages": 1,
        "results": [
          {
            "id": 5239,
            "type": "case",
            "featured": false,
            "title": "Community Justice Boards in Pima County, Arizona",
            "description": "",
            "body": "<p>Problems and Purpose</p><p>In the early 1990s, juvenile crime rates in Arizona reached their peak with the population of detainees reaching a record level. In response, the juvenile court system as well as detention facilities were expanded to meet the growing need, and Community Justice Boards were created in 1998.<a href=\"#ref%201\" name=\"cite%201\" id=\"cite 1\">[1]</a> The program offers an alternative for first and second-time, non-violent, juvenile offenders who would otherwise be prosecute",
            "location_name": "Pima County Attorney's Office",
            "address1": "32 N. Stone Ave Legal Services Building",
            "address2": "",
            "city": "Tucson",
            "province": "Arizona",
            "postal_code": "85701",
            "country": "United States",
            "latitude": "0° 0' 0\" N",
            "longitude": "0° 0' 0\" E",
            "images": [
              "/images/texture_4.svg"
            ],
            "videos": [
              "https://youtu.be/TSpqAZW7lyc"
            ],
            "updated_date": "2018-03-06T06:14:46.000Z",
            "bookmarked": false
          },
          {
            "id": 5237,
            "type": "method",
            "featured": false,
            "title": "Sustained Dialogue",
            "description": "",
            "body": "<p><em>Note: the following entry is a stub. Please help us complete it. </em></p><h3>Definition</h3><p>Sustained Dialogue is defined as a 'changemaking process' which</p><ol><li>\"Focuses on transforming relationships that cause problems, create conflict, and block change; and</li><li>Emphasizes the importance of effective change over time\" [1]</li></ol><h3>Problems and Purpose History Participant Recruitment and Selection Deliberation, Decisions, and Public Interaction</h3><p>Sustained Dialogue ",
            "location_name": "",
            "address1": "",
            "address2": "",
            "city": "",
            "province": "",
            "postal_code": "",
            "country": "",
            "latitude": "",
            "longitude": "",
            "images": [
              "/images/texture_1.svg"
            ],
            "videos": [],
            "updated_date": "2018-03-04T17:38:43.000Z",
            "bookmarked": false
          },
          {
            "id": 327,
            "type": "organization",
            "featured": false,
            "title": "Sustained Dialogue Institute",
            "description": "",
            "body": "<p>A complete entry on this organization is available at <a href=\"https://participedia.net/en/organizations/international-institute-sustained-dialogue\">https://participedia.net/en/organizations/international-institute-sustai...</a></p>",
            "location_name": "",
            "address1": "",
            "address2": "",
            "city": "Washington",
            "province": "District Of Columbia",
            "postal_code": "",
            "country": "United States",
            "latitude": "0° 0' 0\" N",
            "longitude": "0° 0' 0\" E",
            "images": [
              "/images/texture_1.svg"
            ],
            "videos": [],
            "updated_date": "2018-03-04T17:14:26.000Z",
            "bookmarked": true
          },
        ],
      },
      "bookmarks": {
        "totalResults": 1,
        "totalPages": 1,
        "results": [
          {
            "id": 327,
            "type": "organization",
            "featured": false,
            "title": "Sustained Dialogue Institute",
            "description": "",
            "body": "<p>A complete entry on this organization is available at <a href=\"https://participedia.net/en/organizations/international-institute-sustained-dialogue\">https://participedia.net/en/organizations/international-institute-sustai...</a></p>",
            "location_name": "",
            "address1": "",
            "address2": "",
            "city": "Washington",
            "province": "District Of Columbia",
            "postal_code": "",
            "country": "United States",
            "latitude": "0° 0' 0\" N",
            "longitude": "0° 0' 0\" E",
            "images": [
              "/images/texture_1.svg"
            ],
            "videos": [],
            "updated_date": "2018-03-04T17:14:26.000Z",
            "bookmarked": true
          },
        ],
      },
    };

    // static text
    const languageOptions = [{ key: "en", value: "English" }, { key: "fr", value: "French" }];
    const staticTxt = {
      languageOptions: languageOptions,
    };

    // only pass down the neccessary keys for the edit view
    const userEditKeys = ["id", "hidden", "name", "email", "location", "language", "login", "picture_url", "bio", "isadmin"]
    const userEditJSON = {};
    userEditKeys.forEach(key => {
      userEditJSON[key] = userJSON[key];
    });

    // depending on view, return correct template
    if (view === "edit") {
      return res.status(200).render("user-edit", {
        user: userEditJSON,
        static: staticTxt,
      });
    } else {
      return res.status(200).render("user-view", { user: userJSON, static: staticTxt });
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
router.get("/:userId", function(req, res) {
  try {
    return getUserById(req.params.userId || req.user.user_id, req, res, "view");
  } catch (error) {
    console.error("Problem in /user/:userId");
    console.trace(error);
  }
});

router.get("/:userId/edit", function(req, res) {
  try {
    return getUserById(req.params.userId || req.user.user_id, req, res, "edit");
  } catch (error) {
    console.error("Problem in /user/:userId");
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
  try {
    let user = req.body;
    let pictureUrl = user.picture_url || user.picture;
    if (user.user_metadata && user.user_metadata.customPic) {
      pictureUrl = user.user_metadata.customPic;
    }
    await db.none(UPDATE_USER, {
      id: user.id,
      name: user.name,
      language: req.params.language || "en",
      picture_url: pictureUrl,
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
