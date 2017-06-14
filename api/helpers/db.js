let promise = require("bluebird");
let { isArray } = require("lodash");
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
    return (
      "ARRAY[" +
      atts
        .map(
          att =>
            ("(" +
              as.text(att.url) +
              ", " +
              as.text(att.title ? att.title : "") +
              ", " +
              att.size ===
              undefined
              ? "null"
              : as.number(att.size) + ")")
        )
        .join(", ") +
      "]::attachment[]"
    );
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
    return (
      "ARRAY[" +
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
      "]::video[]"
    );
  }
  if (!url) {
    return "'{}'";
  }
  url = as.text(url);
  title = as.text(title ? title : "");
  return `ARRAY[(${url}, ${title})]::video[]`;
}

// as.strings / as.tags (could be used as as.strings too
function strings(strList) {
  if (!strList) {
    return "'{}'";
  }
  return "ARRAY[" + strList.map(s => as.text(s)).join(", ") + "]::text[]";
}

const tags = strings; // alias for descriptiveness

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

const as = Object.assign({}, pgp.as, {
  author,
  attachment,
  attachments,
  location,
  videos,
  number,
  strings,
  tags
});

const helpers = pgp.helpers;

module.exports = {
  db,
  sql,
  as,
  helpers
};
