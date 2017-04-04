let promise = require("bluebird");
let { isString } = require("lodash");
let options = {
  // Initialization Options
  promiseLib: promise
};
if (process.env.LOG_QUERY === "true") {
  options.query = evt => console.info("Executing query %s", evt.query);
}
let pgp = require("pg-promise")(options);
const path = require("path");
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

// as.author
function author(user_id, name) {
  // TODO: escape user_id and name to avoid injection attacks
  if (!(user_id && name)) {
    throw new Exception("Must have both user_id and name for an author");
  }
  return `(${user_id}, "now", "${name}")::author`;
}

// as.attachment
function attachment(url, title, size) {
  // TODO: escape url, title, size to avoid injection attacks
  if (!url) {
    return "null";
  }
  title = title || "";
  if (size === undefined) {
    size = "null";
  }
  return `('${url}', '${title}', ${size})::attachment`;
}

// as.attachments
function attachments(url, title, size) {
  // TODO: escape url, title, size to avoid injection attacks
  if (!url) {
    return "'{}'";
  }
  title = title || "";
  if (size === undefined) {
    size = "null";
  }
  return `ARRAY[('${url}', '${title}', ${size})]::attachment[]`;
}

// as.videos
function videos(url, title) {
  // TODO: escape url, title to avoid injection attacks
  if (!url) {
    return "{}";
  }
  title = title || "";
  return `ARRAY[('${url}', '${title}')]::video[]`;
}

// as.location
function location(location) {
  // TODO: escape all values of location to avoid injection attacks
  if (!location) {
    return "null";
  }
  let { label, lat, long, gmaps } = location;
  let name = label;
  let city = "";
  let province = "";
  let country = "";
  gmaps.address_components.forEach(function(component) {
    if (component.types.includes("city")) {
      city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      province = component.long_name; // could also be a state or territory
    } else if (component.types.includes("country")) {
      country = component.long_name;
    }
  });
  return `('${name}', '', '', '${city}', '${province}', '${country}', '', '${lat}', '${long}')::geolocation`;
}

function related_list(owner, related, id_list) {
  // TODO: escape id_list to avoid injection attacks
  // owner == case for case__related_methods
  // related == method for case__related_methods
  // id_list is either a single identifier or an array of identifiers
  if (!id_list || !id_list.length) {
    return "";
  }
  if (isString(id_list)) {
    id_list = [id_list];
  }
  let values = id_list.map(id => `(${id})`).join(", ");
  return `
  INSERT INTO
    ${owner}__related_${related}s
  SELECT
    ${owner}_id, related_${related}_id
  FROM
    (select ${owner}_id FROM insert_${owner}),
    (VALUES ${values}) as t (related_${related}_id)
  ON CONFLICT
    (${owner}_id, related_${related}_id) DO NOTHING;`;
}

var as = Object.assign({}, pgp.as, {
  author,
  attachment,
  attachments,
  location,
  videos,
  related_list
});

module.exports = { db, sql, as };
