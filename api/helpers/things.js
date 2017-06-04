let { isString } = require("lodash");
let log = require("winston");
const cache = require("apicache");
const equals = require("deep-equal");
const moment = require("moment");

const { as, db, sql } = require("./db");
const { preferUser } = require("../helpers/user");

function addRelatedList(owner_type, owner_id, related_type, id_list) {
  // TODO: escape id_list to avoid injection attacks
  if (!id_list || !id_list.length) {
    return "";
  }
  if (isString(id_list)) {
    id_list = [id_list];
  }
  owner_id = as.number(owner_id);
  let values = id_list
    .map(id => {
      let escaped_id = as.number(id);
      if (`${owner_type}${owner_id}` < `${related_type}${id}`) {
        return `('${owner_type}', ${owner_id}, '${related_type}', ${id})`;
      } else {
        return `('${related_type}', ${id}, '${owner_type}', ${owner_id})`;
      }
    })
    .join(", ");
  return `
  INSERT INTO related_nouns (type_1, id_1, type_2, id_2)
  VALUES ${values};`;
}

function removeRelatedList(owner_type, owner_id, related_type, id_list) {
  // TODO: escape id_list to avoid injection attacks
  if (!id_list || !id_list.length) {
    return "";
  }
  if (isString(id_list)) {
    id_list = [id_list];
  }
  owner_id = as.number(owner_id);
  return id_list
    .map(id => {
      let escaped_id = as.number(id);
      if (`${owner_type}${owner_id}` < `${related_type}${id}`) {
        return `DELETE FROM related_nouns
                WHERE type_1 = '${owner_type}' AND id_1 = ${owner_id} AND
                      type_2 = '${related_type}' AND id_2 = ${id};`;
      } else {
        return `DELETE FROM related_nouns
                WHERE type_1 = '${related_type}' AND id_1 = ${id} AND
                      type_2 = '${owner_type}' AND id_2 = ${owner_id};`;
      }
    })
    .join("");
}

const difference = (set1, set2) => new Set([...set1].filter(x => !set2.has(x)));

function diffRelatedList(first, second) {
  // both lists are related_item objects of the same type
  const first_set = new Set(first.map(rel => rel.id));
  const second_set = new Set(second.map(rel => rel.id));
  remove_set = difference(first_set, second_set);
  add_set = difference(second_set, first_set);
  const remove = first.filter(x => remove_set.has(x.id));
  const add = second.filter(x => add_set.has(x.id));
  return { remove, add };
}

function getXByIdFns(type) {
  const getById_lang_userId = async function(thingId, lang, userId) {
    const thing = await db.one(sql(`../sql/${type}_by_id.sql`), {
      thingId,
      lang,
      userId
    });
    return thing;
  };

  const getByRequest = async function(req) {
    await preferUser(req);
    const thingId = as.number(req.params[`${type}Id`]);
    const lang = as.value(req.params.language || "en");
    const userId = req.user ? req.user.user_id : null;
    return await getById_lang_userId(thingId, lang, userId);
  };

  const returnById = async function(req, res) {
    try {
      const thing = await getByRequest(req);
      res.status(200).json({ OK: true, data: thing });
    } catch (error) {
      log.error(
        "Exception in GET /%s/%s => %s",
        type,
        req.params[`${type}Id`],
        error
      );
      res.status(500).json({
        OK: false,
        error: error
      });
    }
  };
  return {
    getById_lang_userId,
    getByRequest,
    returnById
  };
}

const getByType_id = {
  case: getXByIdFns("case"),
  method: getXByIdFns("method"),
  organization: getXByIdFns("organization")
};

function getEditXById(type) {
  return async function editById(req, res) {
    cache.clear();
    const thingId = as.number(req.params[type + "Id"]);
    try {
      // FIXME: Figure out how to get all of this done as one transaction
      const lang = as.value(req.params.language || "en");
      const userId = req.user.user_id;
      const oldThing = await getByType_id[type].getById_lang_userId(
        thingId,
        lang,
        userId
      );
      const newThing = req.body;
      let updatedText = {
        body: oldThing.body,
        title: oldThing.title,
        language: lang,
        type: type,
        id: thingId
      };
      let updatedThingFields = [];
      let isTextUpdated = false;
      let anyChanges = false;
      let retThing = null;

      /* DO ALL THE DIFFS */
      Object.keys(oldThing).forEach(async key => {
        if (
          // All the ways to check if a value has not changed
          newThing[key] === undefined ||
          equals(oldThing[key], newThing[key]) ||
          (/_date/.test(key) &&
            moment(oldThing[key]).format() ===
              moment(newThing[key]).format()) ||
          (/related_/.test(key) &&
            equals(
              oldThing[key].map(x => x.id),
              newThing[key].map(x => x.id || x.value)
            ))
        ) {
          // skip, do nothing, no change for this key
        } else if (!equals(oldThing[key], newThing[key])) {
          anyChanges = true;
          // If the body or title have changed: add a record in X__localized_texts
          if (key === "body" || key === "title") {
            updatedText[key] = newThing[key];
            isTextUpdated = true;
            // If related_cases, related_methods, or related_organizations have changed
            // update records in related_nouns
          } else if (
            [
              "related_cases",
              "related_methods",
              "related_organizations"
            ].includes(key)
          ) {
            // DELETE / INSERT any needed rows for related_nouns
            const oldList = oldThing[key];
            const newList = newThing[key];
            newList.forEach(x => x.id = x.id || x.value); // handle client returning value vs. id
            const diff = diffRelatedList(oldList, newList);
            const relType = key.split("_")[1].slice(0, -1); // related_Xs => X
            const add = addRelatedList(
              type,
              thingId,
              relType,
              diff.add.map(x => x.id)
            );
            const remove = removeRelatedList(
              type,
              thingId,
              relType,
              diff.remove.map(x => x.id)
            );
            if (add || remove) {
              await db.none(add + remove);
            }
            anyChanges = true;
            // If any of the fields of thing itself have changed, update record in appropriate table
          } else if (["id", "post_date", "updated_date"].includes(key)) {
            log.warn(
              "Trying to update a field users shouldn't update: %s",
              key
            );
            // take no action
          } else if (key === "featured" && !user.groups.includes("Curators")) {
            log.warn("Non-curator trying to update Featured flag");
            // take no action
          } else if (key === "location") {
            updatedThingFields.push({
              key: as.name(key),
              value: as.location(newThing[key])
            });
          } else if (key === "tags") {
            updatedThingFields.push({
              key: as.name(key),
              value: as.tags(newThing[key])
            });
          } else if (key === "lead_image") {
            var img = newThing[key];
            updatedThingFields.push({
              key: as.name(key),
              value: as.attachment(img.url, img.title, img.size)
            });
          } else if (["other_images", "files"].includes(key)) {
            updatedThingFields.push({
              key: as.name(key),
              value: as.attachments(newThing[key])
            });
          } else {
            let value = oldThing[key];
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
      if (anyChanges) {
        // Actually make the changes
        if (isTextUpdated) {
          // INSERT new text row
          await db.none(sql("../sql/insert_localized_text.sql"), updatedText);
        }
        // Update last_updated
        updatedThingFields.push({ key: "updated_date", value: as.text("now") });
        // UPDATE the thing row
        await db.none(sql("../sql/update_noun.sql"), {
          keyvalues: updatedThingFields
            .map(field => field.key + " = " + field.value)
            .join(", "),
          type: type,
          id: thingId
        });
        // INSERT row for X__authors
        await db.none(sql("../sql/insert_author.sql"), {
          user_id: userId,
          type: type,
          id: thingId
        });
        // update materialized view for search
        retThing = await getByType_id[type].getById_lang_userId(
          as.number(thingId),
          lang,
          userId
        );
        // update search index
        await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
      } else {
        // end if anyChanges
        retThing = oldThing;
      } // end if not anyChanges
      res.status(200).json({ OK: true, data: retThing });
    } catch (error) {
      log.error("Exception in PUT /%s/%s => %s", type, thingId, error);
      res.status(500).json({
        OK: false,
        error: error
      });
    } // end catch
  };
}

module.exports = {
  addRelatedList,
  removeRelatedList,
  getXByIdFns,
  diffRelatedList,
  difference,
  getEditXById,
  getByType_id
};
