let promise = require("bluebird");
let { isArray, isObject } = require("lodash");
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
function attachment(att) {
  if (!att) {
    return "null";
  }
  if (isObject(att)) {
    const url = as.text(att.url);
    const title = as.text(att.title);
    const size = att.size === undefined ? "null" : as.number(size);
    return `(${url}, ${title}, ${size})::attachment`;
  } else {
    const urlOnly = as.text(att);
    return `(${urlOnly}, '', null)::attachment`;
  }
}

// as.attachments
function attachments(url, title, size) {
  if (isArray(url)) {
    let atts = url;
    return (
      "ARRAY[" +
      atts
        .map(vid => {
          let url, title, size;
          if (isObject(vid)) {
            url = as.text(vid.url);
            title = as.text(vid.title ? vid.title : "");
            size = vid.size === undefined ? null : as.number(vid.size);
            return `(${url}, ${title}, ${size})`;
          } else {
            return `('${vid}', '', null)`;
          }
        })
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
        .map(vid => {
          if (isObject(vid)) {
            as.text(vid.url);
          } else {
            as.text(vid);
          }
        })
        .join(", ") +
      "]::text[]"
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
  let { label, lat, long, gmaps, city, province, country } = location;
  let name = as.text(label);
  lat = as.text(lat);
  long = as.text(long);
  city = as.text(city);
  province = as.text(province);
  country = as.text(country);
  if (gmaps) {
    gmaps.address_components.forEach(function(component) {
      if (component.types.includes("locality")) {
        city = as.text(component.long_name);
      } else if (component.types.includes("administrative_area_level_1")) {
        province = as.text(component.long_name); // could also be a state or territory
      } else if (component.types.includes("country")) {
        country = as.text(component.long_name);
      }
    });
  }
  return `(${name}, '', '', ${city}, ${province}, ${country}, '', ${lat}, ${long})::geolocation`;
}

// replace as.text, don't convert null to "null" because that's dumb
function text(value) {
  if (value === null) {
    return value;
  }
  return pgp.as.text(value);
}

const as = Object.assign({}, pgp.as, {
  author,
  attachment,
  attachments,
  location,
  videos,
  number,
  strings,
  tags,
  text
});

const helpers = pgp.helpers;

module.exports = {
  db,
  sql,
  as,
  helpers
};
