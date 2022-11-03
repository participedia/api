"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
// let { db, as, USER_BY_ID, UPDATE_USER } = require("../helpers/db");
// let { fixUpURLs, placeHolderPhotos } = require("../helpers/things");

const logError = require("../helpers/log-error.js");

const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

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
 router.get("/review", async function(req, res) {
    // make sure we have a logged in user
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to perform this action." });
    }

    try {
    
        // const data = await getUserById(userId, req, res, "view");
    
        // if (!data) {
        //   return res.status(404).render("404");
        // }
        const data = "";
    
        // return html template
        const returnType = req.query.returns || "html";
        if (returnType === "html") {
          return res.status(200).render(`review-entries`, data);
        } else if (returnType === "json") {
          return res.status(200).json(data);
        }
      } catch (error) {
        console.error("Exception in /user/%s => %s", userId, error.message);
        logError(error);
      }
  });

module.exports = router;