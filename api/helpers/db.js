let promise = require("bluebird");
let { isString, isArray } = require("lodash");
let options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true // when building SQL queries dynamically, capitalize SQL keywords
};
if (process.env.LOG_QUERY === "true") {
  options.query = evt => console.info("Executing query %s", evt.query);
}
let pgp = require("pg-promise")(options);
const path = require("path");
let log = require("winston");
let connectionString = process.env.DATABASE_URL;
let parse = require("pg-connection-string").parse;
let config;

try {
  config = parse(connectionString);
  if (process.env.NODE_ENV === "test" || config.host === "localhost") {
    config.ssl = false;
  } else {
    config.ssl = true;
  }
} catch (e) {
  console.error("# Error parsing DATABASE_URL environment variable");
}
let db = pgp(config);

function sql(filename) {
  return new pgp.QueryFile(path.join(__dirname, filename), { minify: true });
}

// as.number, enhances existing as.number to cope with numbers as strings
function number(value) {
  return pgp.as.number(Number(value));
}

// as.author
function author(user_id, name) {
  // TODO: escape user_id and name to avoid injection attacks
  if (!(user_id && name)) {
    throw new Exception("Must have both user_id and name for an author");
  }
  user_id = as.number(user_id);
  name = as.text(name);
  return `(${user_id}, 'now', ${name})::author`;
}

// as.attachment
function attachment(url, title, size) {
  if (!url) {
    return "null";
  }
  url = as.text(url);
  title = as.text(title ? title : "");
  size = size === undefined ? "null" : as.number(size);
  return `(${url}, ${title}, ${size})::attachment`;
}

// as.attachments
function attachments(url, title, size) {
  if (isArray(url)) {
    let atts = url;
    return "ARRAY[" +
      atts
        .map(
          vid =>
            "(" +
              as.text(att.url) +
              ", " +
              as.text(att.title ? att.title : "") +
              ", " +
              att.size ===
              undefined
              ? "null"
              : as.number(att.size) + ")"
        )
        .join(", ") +
      "]::attachment[]";
  }
  url = as.text(url ? url : "{}");
  title = as.text(title ? title : "");
  size = size === undefined ? "null" : as.number(size);
  if (size === undefined) {
    size = "null";
  }
  return `ARRAY[(${url}, ${title}, ${size})]::attachment[]`;
}

// as.videos
function videos(url, title) {
  if (isArray(url)) {
    let vids = url;
    return "ARRAY[" +
      vids
        .map(
          vid =>
            "(" +
            as.text(vid.url) +
            ", " +
            as.text(vid.title ? vid.title : "") +
            ")"
        )
        .join(", ") +
      "]::video[]";
  }
  if (!url) {
    return "'{}'";
  }
  url = as.text(url);
  title = as.text(title ? title : "");
  return `ARRAY[(${url}, ${title})]::video[]`;
}

// as.location
function location(location) {
  // TODO: escape all values of location to avoid injection attacks
  if (!location) {
    return "null";
  }
  let { label, lat, long, gmaps } = location;
  let name = as.text(label);
  lat = as.text(lat);
  long = as.text(long);
  let city = "''";
  let province = "''";
  let country = "''";
  gmaps.address_components.forEach(function(component) {
    if (component.types.includes("locality")) {
      city = as.text(component.long_name);
    } else if (component.types.includes("administrative_area_level_1")) {
      province = as.text(component.long_name); // could also be a state or territory
    } else if (component.types.includes("country")) {
      country = as.text(component.long_name);
    }
  });
  return `(${name}, '', '', ${city}, ${province}, ${country}, '', ${lat}, ${long})::geolocation`;
}

function related_list(owner_type, owner_id, related_type, id_list) {
  // TODO: escape id_list to avoid injection attacks
  if (!id_list || !id_list.length) {
    return null;
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
  VALUES ${values}`;
}

const as = Object.assign({}, pgp.as, {
  author,
  attachment,
  attachments,
  location,
  videos,
  related_list,
  number
});

function getXByIdFns(type, getUserIfExists) {
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

const helpers = pgp.helpers;

module.exports = { db, sql, as, helpers, getXByIdFns };
