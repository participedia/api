const promise = require("bluebird");
const url = require("url");
const { isArray, isObject, isDate, isString, uniq } = require("lodash");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true // when building SQL queries dynamically, capitalize SQL keywords
};
if (process.env.LOG_QUERY === "true") {
  options.query = evt => console.info("Executing query %s", evt.query);
}
const pgp = require("pg-promise")(options);
const path = require("path");
const log = require("winston");
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
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

let dbtagkeys;
// let dbcasekeys;

async function initKeys() {
  // we're just getting the keys for validation, which are the same for
  // every language, so hard-coding 'en' here is OK.
  // dbcasekeys = (await db.one(`
  //   SELECT to_json(array_agg(key)) AS keys
  //   FROM localized_case_field_values
  //   WHERE language = 'en';
  // `)).keys;
  dbtagkeys = (await db.one(`
    SELECT to_json(array_agg(key)) as keys
    FROM rotate_tags_localized('en') AS tagvalues
    WHERE tagvalues.key <> 'language';
  `)).keys;
}
initKeys().then(() => console.log("keys initialized")); // we'll need these when users submit data

function sql(filename) {
  return new pgp.QueryFile(path.join(__dirname, filename), {
    minify: true
  });
}

function ErrorReporter() {
  this.errors = [];
  let self = this;
  this.hasErrors = () => this.errors.length > 0;
  this.try = function(fn) {
    return function(...args) {
      try {
        return fn(...args);
      } catch (e) {
        self.errors.push(e.message);
        // console.error("Capturing error to report to client: " + e.message);
        return e.message;
        // console.trace(e);
      }
    };
  };
}

// as.number, enhances existing as.number to cope with numbers as strings
function number(value) {
  if (value === "") {
    return null;
  }
  return pgp.as.number(Number(value));
}

function integer(value) {
  if (value === "") {
    return null;
  }
  if (value === "NaN") {
    throw new Error('Expected integer, got "NaN" as a string');
  }
  let retVal = pgp.as.number(parseInt(value, 10));
  if (Number.isNaN(retVal)) {
    throw new Error("Expected integer value, got " + value);
  }
  return retVal;
}

function asFloat(value) {
  if (value === "") {
    return null;
  }
  if (value === "NaN") {
    throw new Error('Expected float, got "NaN" as a string');
  }
  let retVal = pgp.as.number(parseFloat(value));
  if (Number.isNaN(retVal)) {
    throw new Error("Expected float value, got " + value);
  }
  return retVal;
}

// as.author
function author(user_id, name) {
  // TODO: escape user_id and name to avoid injection attacks
  if (!(user_id && name)) {
    throw new Error("Must have both user_id and name for an author");
  }
  user_id = as.number(user_id);
  name = text(name);
  return `(${user_id}, 'now', ${name})::author`;
}

// as.attachment
function attachment(att) {
  if (!att) {
    return null;
  }
  if (isObject(att)) {
    const url = asUrl(att.url);
    const title = as.text(att.title);
    const size = att.size === undefined ? null : as.number(size);
    return `(${url}, ${title}, ${size})::attachment`;
  } else {
    throw new Error("attachment is wrong shape");
  }
}

function escapedText(value) {
  return `\\"${value}\\"`;
}

function asUrl(value) {
  if (!value) {
    return escapedText("");
  }
  if (isObject(value)) {
    console.error("Expecting URL, received: %s", value);
    throw new Error("Not a URL: " + value);
    return escapedText("");
  }
  try {
    if (!value.startsWith("http")) {
      value = process.env.AWS_UPLOADS_URL + value;
    }
    // return new URL(value).href;
    return escapedText(new URL(value).href);
  } catch (e) {
    console.error("Expected URL, received: %s", JSON.stringify(value));
    throw e;
  }
}

function urls(urlList) {
  return as.array(uniq((urlList || []).map(asUrl).filter(x => !!x)));
}

function id(obj) {
  if (!obj) {
    return null;
  }
  return as.integer(obj.id);
}

// as.ids, strip [{text,value}] down to [value], then format as array of numbers
function ids(idList) {
  if (!idList) return [];
  return idList.map(item => parseInt(item.key, 10));
}

// as.strings
function strings(strList) {
  return as.array(uniq((strList || []).map(text).filter(x => !!x)));
  //  return "ARRAY[" + strList.map(s => as.text(s)).join(", ") + "]::text[]";
}

function casekey(obj, group) {
  if (group === undefined) {
    throw new Error("Group cannot be undefined");
  }
  if (obj === undefined) {
    throw new Error("Object cannot be undefined for group " + group);
  }
  if (obj === null || obj === "") {
    return null;
  }
  if (obj.key === undefined) {
    throw new Error("Key cannot be undefined for group " + group);
  }
  //  if (dbcasekeys.includes(`${group}_${obj.key}`)) {
  // FIXME: Need to re-add validation that key is legal for this field
  if (obj.key.length > 0) {
    return obj.key;
  }
  return "";
}

function casekeyflat(str, group) {
  // FIXME: add validation of legal keys
  return text(str);
}

function casekeys(objList, group) {
  if (group === undefined) {
    throw new Error("Group cannot be undefined");
  }
  if (objList === undefined) {
    throw new Error("objList cannot be undefined for group " + group);
  }
  try {
    return (
      uniq((objList || []).map(k => casekey(k, group)).filter(x => !!x)) || "{}"
    );
  } catch (e) {
    console.error(
      "Attempting to convert and filter a list of keys for %s, but got %s for the list",
      group,
      JSON.stringify(objList)
    );
    throw e;
  }
}

function tagkey(obj) {
  if (obj === undefined) {
    throw new Error("Object cannot be undefined for tag");
  }
  if (obj.key === undefined) {
    throw new Error("Key cannot be undefined for tag");
  }
  if (dbtagkeys.includes(obj.key)) {
    return obj.key;
  } else {
    console.warn("failed tag: %s", obj.key);
  }
  return null;
}

function tagkeys(objList) {
  return uniq((objList || []).map(tagkey).filter(x => !!x));
}

function aMedium(obj) {
  if (isString(obj)) {
    obj = { url: obj, attribution: "", title: "" };
  }
  if (!obj.url) return null;
  return [
    '"(',
    asUrl(obj.url),
    ",",
    // attribution: obj.attribution,
    text(obj.attribution),
    ",",
    // title: obj.title
    text(obj.title),
    ')"'
  ].join("");
}

function aSourcedMedia(obj) {
  if (isString(obj)) {
    obj = { url: obj, source_url: "", attribution: "", title: "" };
  }
  if (!obj.url) return null;
  return [
    '"(',
    asUrl(obj.url),
    ",",
    asUrl(obj.source_url),
    ",",
    // attribution: obj.attribution,
    text(obj.attribution),
    ",",
    // title: obj.title
    text(obj.title),
    ')"'
  ].join("");
}

function simpleArray(values) {
  return "{" + values.join(",") + "}";
}

function media(mediaList) {
  return simpleArray((mediaList || []).map(aMedium).filter(x => !!x)); // remove nulls
}

function sourcedMedia(mediaList) {
  return simpleArray((mediaList || []).map(aSourcedMedia).filter(x => !!x)); // remove nulls
}

function boolean(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === true || value === false) {
    return value;
  }
  return false;
}

// Yes, these should be converted to booleans
function yesno(value) {
  if (!value) {
    return null;
  }
  if (value === "yes" || value === "no") {
    return value;
  }
  throw new Error("Only yes or no are allowed here");
}

function date(value) {
  if (isDate(value)) {
    return text(value);
  } else {
    if (!value) {
      return null;
    }
    return new Date(value);
  }
}

// replace as.text, don't convert null to "null" because that's dumb
function text(value) {
  // FIXME: strip out ALL HTML
  return value || "";
}

function richtext(value) {
  // FIXME: only allow white-listed HTML
  return text(value);
}

const as = Object.assign({}, pgp.as, {
  boolean,
  author,
  // attachment,
  // attachments,
  date,
  id,
  ids,
  integer,
  float: asFloat,
  // localed,
  media,
  number,
  sourcedMedia,
  // strings,
  casekey,
  casekeyflat,
  casekeys,
  richtext,
  tagkeys,
  text,
  url: asUrl,
  urls,
  yesno
});

const helpers = pgp.helpers;

const CASE_EDIT_BY_ID = sql("../sql/case_edit_by_id.sql");
const CASE_EDIT_STATIC = sql("../sql/case_edit_static.sql");
const CASE_VIEW_BY_ID = sql("../sql/case_view_by_id.sql");
const CASE_VIEW_STATIC = sql("../sql/case_view_static.sql");
const METHOD_EDIT_BY_ID = sql("../sql/method_edit_by_id.sql");
const METHOD_VIEW_BY_ID = sql("../sql/method_view_by_id.sql");
const ORGANIZATION_EDIT_BY_ID = sql("../sql/organization_edit_by_id.sql");
const ORGANIZATION_VIEW_BY_ID = sql("../sql/organization_view_by_id.sql");
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
const UPDATE_CASE = sql("../sql/update_case.sql");

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
  UPDATE_CASE,
  CASE_EDIT_BY_ID,
  CASE_EDIT_STATIC,
  CASE_VIEW_BY_ID,
  CASE_VIEW_STATIC,
  METHOD_EDIT_BY_ID,
  METHOD_VIEW_BY_ID,
  ORGANIZATION_EDIT_BY_ID,
  ORGANIZATION_VIEW_BY_ID,
  ErrorReporter
};
