let promise = require("bluebird");
let { isArray, isObject } = require("lodash");
let options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true // when building SQL queries dynamically, capitalize SQL keywords
};
//if (process.env.LOG_QUERY === "true") {
if (true) {
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
function old_attachments(url, title, size) {
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

// as.ids, strip [{text,value}] down to [value], then format as array of numbers
function ids(idList) {
  if (!idList) {
    return "'{}'";
  }
  return (
    "ARRAY[" + idList.map(s => as.number(s.value)).join(", ") + "]::integer[]"
  );
}

// as.strings
function strings(strList) {
  if (!strList) {
    return "'{}'";
  }
  if (!strList.map) {
    console.error(
      "What kind of array does not have a map()? This kind: %o",
      strList
    );
    return "'{}'";
  }
  return "ARRAY[" + strList.map(s => as.text(s)).join(", ") + "]::text[]";
}

function localed(strList) {
  // localed strings come in as as list of objects with {text, value}, we want value (the localization key)
  if (strList.length && typeof strList[0] === "object") {
    return strings(strList.map(s => s.value));
  } else {
    // someone passes us a list of strings, yay!
    return strings(strList);
  }
}

function attachments(attList) {
  if (attList.length && typeof attList[0] === "object") {
    return strings(attList.map(a => a.url));
  } else {
    return strings(attList);
  }
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
  ids,
  localed,
  number,
  strings,
  text
});

const helpers = pgp.helpers;

const CASE_EDIT_BY_ID = sql(`../sql/case_edit_by_id.sql`);
const CASE_VIEW_BY_ID = sql(`../sql/case_view_by_id.sql`);
const METHOD_EDIT_BY_ID = sql(`../sql/method_edit_by_id.sql`);
const METHOD_VIEW_BY_ID = sql(`../sql/method_view_by_id.sql`);
const ORGANIZATION_EDIT_BY_ID = sql(`../sql/organization_edit_by_id.sql`);
const ORGANIZATION_VIEW_BY_ID = sql(`../sql/organization_view_by_id.sql`);
const INSERT_LOCALIZED_TEXT = sql("../sql/insert_localized_text.sql");
const UPDATE_NOUN = sql("../sql/update_noun.sql");
const INSERT_AUTHOR = sql("../sql/insert_author.sql");
const USER_BY_EMAIL = sql("../sql/user_by_email.sql");
const USER_BY_ID = sql("../sql/user_by_id.sql");
const CREATE_USER_ID = sql("../sql/create_user_id.sql");
const CASES_BY_COUNTRY = sql("../sql/cases_by_country.sql");
const CREATE_CASE = sql("../sql/create_case.sql");
const CREATE_METHOD = sql("../sql/create_method.sql");
const CREATE_ORGANIZATION = sql("../sql/create_organization.sql");
const TITLES_FOR_THINGS = sql("../sql/titles_for_things.sql");
const SEARCH = sql("../sql/search.sql");
const FEATURED_MAP = sql("../sql/featuredmap.sql");
const FEATURED = sql("../sql/featured.sql");
const SEARCH_MAP = sql("../sql/searchmap.sql");
const LIST_MAP_CASES = sql("../sql/list_map_cases.sql");
const LIST_MAP_ORGANIZATIONS = sql("../sql/list_map_orgs.sql");
const LIST_TITLES = sql("../sql/list_titles.sql");
const LIST_SHORT = sql("../sql/list_short.sql");
const UPDATE_USER = sql("../sql/update_user.sql");

module.exports = {
  db,
  as,
  helpers,
  pgp,
  INSERT_LOCALIZED_TEXT,
  UPDATE_NOUN,
  INSERT_AUTHOR,
  USER_BY_EMAIL,
  USER_BY_ID,
  CREATE_USER_ID,
  CASES_BY_COUNTRY,
  CREATE_CASE,
  CREATE_METHOD,
  CREATE_ORGANIZATION,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
  LIST_TITLES,
  LIST_SHORT,
  UPDATE_USER,
  CASE_EDIT_BY_ID,
  CASE_VIEW_BY_ID,
  METHOD_EDIT_BY_ID,
  METHOD_VIEW_BY_ID,
  ORGANIZATION_EDIT_BY_ID,
  ORGANIZATION_VIEW_BY_ID
};
