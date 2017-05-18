let { isString } = require("lodash");
let log = require("winston");

const { as, db, sql } = require("./db");
const { getUserIfExists } = require("../helpers/user");

function addRelatedList(owner_type, owner_id, related_type, id_list) {
  // TODO: escape id_list to avoid injection attacks
  if (!id_list || !id_list.length) {
    return "";
  }
  if (isString(id_list)) {
    id_list = [id_list];
  }
  owner_id = as.number(owner_id);
  // case and related come from our code, we'll trust those
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
  // case and related come from our code, we'll trust those
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
  let retFns = {};
  const typeUC = type[0].toUpperCase() + type.slice(1);
  retFns[`get${typeUC}ById_lang_userId`] = async function(
    thingId,
    lang,
    userId
  ) {
    const theThing = await db.one(sql(`../sql/${type}_by_id.sql`), {
      thingId,
      lang
    });
    const bookmarked = await db.one(sql("../sql/bookmarked.sql"), {
      type,
      thingId,
      userId
    });
    theThing.bookmarked = bookmarked[type];
    return theThing;
  };

  retFns[`get${typeUC}ByRequest`] = async function(req) {
    const thingId = as.number(req.params[`${type}Id`]);
    const lang = as.value(req.params.language || "en");
    const userId = await getUserIfExists(req);
    return await retFns[`get${typeUC}ById_lang_userId`](thingId, lang, userId);
  };

  retFns[`return${typeUC}ById`] = async function(req, res) {
    try {
      const thing = await retFns[`get${typeUC}ByRequest`](req);
      res.status(200).json({ OK: true, data: thing });
    } catch (error) {
      log.error(
        "Exception in GET /case/%s => %s",
        req.params[`${type}Id`],
        error
      );
      res.status(500).json({
        OK: false,
        error: error
      });
    }
  };
  return retFns;
}

module.exports = {
  addRelatedList,
  removeRelatedList,
  getXByIdFns,
  diffRelatedList,
  difference
};
