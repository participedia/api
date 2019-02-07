let { isString } = require("lodash");
let log = require("winston");
const cache = require("apicache");
const equals = require("deep-equal");
const moment = require("moment");

const {
  as,
  db,
  INSERT_LOCALIZED_TEXT,
  UPDATE_NOUN,
  INSERT_AUTHOR,
  CASE_EDIT_BY_ID,
  CASE_VIEW_BY_ID,
  METHOD_EDIT_BY_ID,
  METHOD_VIEW_BY_ID,
  ORGANIZATION_EDIT_BY_ID,
  ORGANIZATION_VIEW_BY_ID
} = require("./db");

// Define the keys we're testing (move these to helper/things.js ?
const titleKeys = ["id", "title"];
const shortKeys = titleKeys.concat([
  "type",
  "images",
  "post_date",
  "updated_date"
]);
const mediumKeys = shortKeys.concat(["body", "bookmarked", "location"]);

const fixUpURLs = function(article) {
  if (article.photos && article.photos.length) {
    article.photos.forEach(
      img =>
        (img.url = process.env.AWS_UPLOADS_URL + encodeURIComponent(img.url))
    );
  }
  if (article.files && article.files.length) {
    article.files.forEach(
      file =>
        (file.url = process.env.AWS_UPLOADS_URL + encodeURIComponent(file.url))
    );
  }
  if (article.longitude.startsWith("0° 0' 0\"")) {
    article.longitude = "";
  }
  if (article.latitude.startsWith("0° 0' 0\"")) {
    article.latitude = "";
  }
};

const returnByType = (res, params, article, static, user) => {
  const { returns, type, view } = params;
  switch (returns) {
    case "htmlfrag":
      return res.status(200).render(type + "-" + view, {
        article,
        static,
        user,
        params,
        layout: false
      });
    case "json":
      return res.status(200).json({ OK: true, article, static, user, params });
    case "csv":
      // TODO: implement CSV
      return res.status(500, "CSV not implemented yet").render();
    case "xml":
      // TODO: implement XML
      return res.status(500, "XML not implemented yet").render();
    case "html": // fall through
    default:
      return res
        .status(200)
        .render(type + "-" + view, { article, static, user, params });
  }
};

const parseGetParams = function(req, type) {
  return Object.assign({}, req.query, {
    type,
    view: as.value(req.params.view || "view"),
    articleid: as.number(req.params.thingid || req.params.articleid),
    lang: as.value(req.query.language || "en"),
    userid: req.user
      ? as.number(req.user.id )
      : null,
    returns: as.value(req.query.returns || "html")
  });
};

/* This is the entry point for getting an article */
const returnThingByRequest = async function(type, req, res) {
  const { articleid, lang, userid, view } = (params = parseGetParams(
    req,
    type
  ));
  const article = await getThingByType_id_lang_userId_view(
    type,
    thingid,
    lang,
    userid,
    view
  );
  const static = await db.one(
    `select * from ${type}_${view}_localized where language = '${lang}';`
  );
  returnByType(req)(res, params, thing, static);
};

/* I can't believe basic set operations are not part of ES5 Sets */
Set.prototype.difference = function(setB) {
  var difference = new Set(this);
  for (var elem of setB) {
    difference.delete(elem);
  }
  return difference;
};

function compareItems(a, b) {
  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  const keysNotInA = bKeys.difference(aKeys);
  if (keysNotInA.size) {
    console.error("Keys in update not found in original: %o", keysNotInA);
  }
  const keysNotInB = aKeys.difference(bKeys);
  if (keysNotInB.size) {
    console.error("Keys in original not found in update: %o", keysNotInB);
  }
}

function getEditXById(type) {
  return async function editById(req, res) {
    cache.clear();
    const thingid = req.thingid || as.number(req.params.thingid);
    const view = req.params.view || "view";
    let lang,
      user,
      userId,
      oldThing,
      newThing,
      updatedText,
      updatedThingFields = [],
      isTextUpdated = false,
      anyChanges = false,
      retThing = null;
    try {
      // FIXME: Figure out how to get all of this done as one transaction
      lang = as.value(req.params.language || "en");
      user = req.user;
      userId = user.user_id;
      oldThing = await getThingByType_id_lang_userId_view(
        type,
        thingid,
        lang,
        userId,
        view
      );
      newThing = req.body;
      // console.log("Received from client: >>> \n%s\n", JSON.stringify(newThing));
      // console.log("User: %s", JSON.stringify(user));
      updatedText = {
        body: oldThing.body,
        title: oldThing.title,
        description: oldThing.description,
        language: lang,
        type: type,
        id: thingid
      };

      /* DO ALL THE DIFFS */
      // FIXME: Does this need to be async?
      Object.keys(oldThing).forEach(async key => {
        // console.error("checking key %s", key);
        const prevValue = oldThing[key];
        let value = newThing[key];
        if (key === "body" && value === "case_body_placeholder") {
          value = "";
        }
        if (
          // All the ways to check if a value has not changed
          // Fixme, check list of ids vs. list of {id, title} pairs
          value === undefined ||
          equals(prevValue, value) ||
          (/_date/.test(key) &&
            moment(prevValue).format() === moment(value).format())
        ) {
          // skip, do nothing, no change for this key
        } else if (!equals(prevValue, value)) {
          anyChanges = true;
          // If the body, title, or description have changed: add a record in localized_texts
          if (key === "body" || key === "title" || key == "description") {
            updatedText[key] = value;
            isTextUpdated = true;
            // If any of the fields of thing itself have changed, update record in appropriate table
          } else if (
            [
              "id",
              "post_date",
              "updated_date",
              "authors",
              "creator",
              "last_updated_by"
            ].includes(key)
          ) {
            log.warn(
              "Trying to update a field users shouldn't update: %s",
              key
            );
            // take no action
          } else if (key === "featured" || key === "hidden") {
            if (user.isadmin) {
              updatedThingFields.push({
                key: as.name(key),
                value: Boolean(value)
              });
            } else {
              log.warn(
                "Non-admin trying to update Featured/hidden flag: %s",
                JSON.stringify(user)
              );
              // take no action
            }
          } else if (
            // fields that are lists of strings
            [
              "tags",
              "links",
              "images",
              "videos",
              "files",
              "if_voting",
              "evaluation_reports",
              "evaluation_links"
            ].includes(key)
          ) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.strings(value)
            });
          } else if (
            // fields that are arrays of text (localized), value pairs
            [
              "issues",
              "relationships",
              "specific_topics",
              "approaches",
              "change_types",
              "decision_methods",
              "funder_types",
              "implementers_of_change",
              "insights_outcomes",
              "learning_resources",
              "organizer_types",
              "purposes",
              "participants_interactions",
              "targeted_participants",
              "typical_purposes",
              "communication_outcomes",
              "communication_modes"
            ].includes(key)
          ) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.localed(value)
            });
          } else if (key === "is_component_of") {
            let component_id = value;
            if (value === null) {
              // delete any existing value
            } else if (typeof value !== "number") {
              component_id = value.value;
            }
            if (component_id !== thingid) {
              if (oldThing.is_component_of !== component_id) {
                updatedThingFields.push({
                  key: as.name(key),
                  value: component_id ? as.number(component_id) : null
                });
              }
            } else {
              // console.warn(
              //   "Do NOT try to add an element as a component of itself or I WILL smack you."
              // );
            }
          } else if (key === "has_components") {
            /* Allow has_components to update those other cases */
            /* trickier, need to make current component the is_component_of for each id */
            /* objects are {label, text, value} where value is the id */
            /* FUCK this gets hard when trying to remove items, and is easily broken by multiple users, remove it */
            // DO NOTHING
          } else if (["process_methods", "primary_organizers"].includes(key)) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.array(value.map(x => x.value))
            });
          } else if (key === "bookmarked") {
            /* FIXME: Move bookmarked API to be a normal update */
            /* stored in a separate table, tied to user */
            console.error("bookmarked: %s", newThing[key]);
          } else if (key === "primary_organizers") {
            updatedThingFields.push({
              key: as.name(key),
              value: as.ids(newThing[key])
            });
          } else {
            let value = newThing[key];
            let asValue = as.text;
            if (typeof value === "boolean") {
              asValue = as.value;
            } else if (value === null) {
              value = "null";
              asValue = as.value;
            } else if (typeof value === "number") {
              asValue = as.number;
            }
            updatedThingFields.push({
              key: as.name(key),
              value: asValue(value)
            });
          }
        }
      }); // end of for loop over object keys
      // console.error("looped through all keys");
      if (true) {
        // Actually make the changes
        if (isTextUpdated) {
          // INSERT new text row
          await db.none(INSERT_LOCALIZED_TEXT, updatedText);
        }
        // Update last_updated
        updatedThingFields.push({ key: "updated_date", value: as.text("now") });
        // UPDATE the thing row
        await db.none(UPDATE_NOUN, {
          keyvalues: updatedThingFields
            .map(field => field.key + " = " + field.value)
            .join(", "),
          type: type,
          id: thingid
        });
        // INSERT row for X__authors
        await db.none(INSERT_AUTHOR, {
          user_id: userId,
          type: type,
          id: thingid
        });
        // update materialized view for search
        retThing = await getThingByType_id_lang_userId_view(
          type,
          as.number(thingid),
          lang,
          userId,
          view
        );
        if (req.thingid) {
          res.status(201).json({
            OK: true,
            object: retThing,
            data: { thingid: retThing.id }
          });
        } else {
          res.status(200).json({ OK: true, object: retThing });
        }
      }
    } catch (error) {
      log.error(
        "Exception in PUT /%s/%s => %s",
        type,
        req.thingid || thingid,
        error
      );
      console.trace(error);
      res.status(500).json({
        OK: false,
        error: error
      });
    } // end catch
    // update search index
    try {
      db.none("REFRESH MATERIALIZED VIEW search_index_en;");
    } catch (error) {
      console.error("Problem refreshing materialized view: %s", error);
    }
  };
}

const supportedTypes = ["case", "method", "organization"];

/** uniq ::: return a list with no repeated items. Items will be in the order they first appear in the list. **/
const uniq = list => {
  let newList = [];
  list.forEach(item => {
    if (!newList.includes(item)) {
      newList.push(item);
    }
  });
  return newList;
};

module.exports = {
  returnThingByRequest,
  getEditXById,
  supportedTypes,
  titleKeys,
  shortKeys,
  mediumKeys,
  uniq,
  fixUpURLs,
  parseGetParams,
  returnByType
};
