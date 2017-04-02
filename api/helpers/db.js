let promise = require("bluebird");
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
  if (!(user_id && name)) {
    throw new Exception("Must have both user_id and name for an author");
  }
  return `(${user_id}, "now", "${name}")::author`;
}

// as.attachment
function attachment(url, title, size) {
  if (!url) {
    return "null";
  }
  title = title || "";
  if (size === undefined) {
    size = "null";
  }
  return `("${url}", "${title}", ${size})::attachment`;
}

// as.attachments
function attachments(url, title, size) {
  if (!url) {
    return "'{}'";
  }
  title = title || "";
  if (size === undefined) {
    size = "null";
  }
  return `ARRAY[("${url}", "${title}", ${size})]::attachment[]`;
}

// as.videos
function videos(url, title) {
  if (!url) {
    return "{}";
  }
  title = title || "";
  return `ARRAY[("${url}", "${title}")]::video[]`;
}

// as.location
function location(location) {
  if (!location) {
    return "null";
  }
  let { label, lat, long, gMaps } = location;
  let name = label;
  let city = "";
  let province = "";
  let country = "";
  gMaps.address_components.forEach(function(component) {
    if (component.types.includes("city")) {
      city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      province = component.long_name; // could also be a state or territory
    } else if (component.types.includes("country")) {
      country = component.long_name;
    }
  });
  return `("${name}", "", "", "${city}", "${province}", "${country}", "", "${lat}", "${long}")::geolocation`;
}

var as = Object.assign({}, pgp.as, { author, attachments, location, videos });

module.exports = { db, sql, as };
