const promise = require("bluebird");
const url = require("url");
const { isArray, isObject, isDate, isString, uniq } = require("lodash");
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true // when building SQL queries dynamically, capitalize SQL keywords
};
const fs = require("fs");
//if (process.env.LOG_QUERY === "true") {
// options.query = evt => (process.env.LAST_QUERY = evt.query);
// options.query = evt => console.log("QUERY: %s", evt.query);
//}
const pgp = require("pg-promise")(options);
const path = require("path");
const log = require("winston");
const connectionString = process.env.DATABASE_URL;
const parse = require("pg-connection-string").parse;
let config;
const uploadToAWS = require("./upload-to-aws.js");

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

const dbtagkeys = JSON.parse(fs.readFileSync("api/helpers/data/tagkeys.json"));
const i18n_en = JSON.parse(fs.readFileSync("locales/en.js"));

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
        console.trace("Capturing error to report to client: " + e.message);
        return e.message;
      }
    };
  };
}

function randomDelay() {
  // return a number of milliseconds between 3 and 8 minutes
  // used to refresh caached objects as needed
  // 3 minutes = 1000 * 60 * 3 = 180,000
  // 5 minutes = 1000 * 60 * 5 = 300,000
  return 180000 + Math.random() * 300000;
}

let _users;
let _cases;
let _methods;
let _organizations;
let _searchDirty = true;

async function _listUsers() {
  _users = (await db.one(
    "SELECT to_json(array_agg((id, name)::object_title)) AS authors FROM users;"
  )).authors;
  setTimeout(_listUsers, randomDelay());
  console.log("user cache refreshed");
}

async function _listCases(lang) {
  _cases = (await db.one(
    "SELECT to_json(get_object_title_list(array_agg(cases.id), ${lang})) as cases from cases;",
    { lang }
  )).cases;
  setTimeout(_listCases, randomDelay());
}

async function _listMethods(lang) {
  _methods = (await db.one(
    "SELECT to_json(get_object_title_list(array_agg(methods.id), ${lang})) as methods from methods;",
    { lang }
  )).methods;
  setTimeout(_listMethods, randomDelay());
}

async function _listOrganizations(lang) {
  _organizations = (await db.one(
    "SELECT to_json(get_object_title_list(array_agg(organizations.id), ${lang})) as organizations from organizations;",
    { lang }
  )).organizations;
  setTimeout(_listOrganizations, randomDelay());
}

async function _refreshSearch() {
  if (_searchDirty) {
    _searchDirty = false;
    await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
  }
  setTimeout(_refreshSearch, randomDelay());
}

if (!process.env.MIGRATIONS) {
  _listUsers();
  _listCases().then(() => console.log("cases cached"));
  _listMethods().then(() => console.log("methods cached"));
  _listOrganizations().then(() => console.log("organizations cached"));
  _refreshSearch().then(() => console.log("search refreshed"));
  db.none("UPDATE localizations SET keyvalues = ${keys} WHERE language='en'", {
    keys: i18n_en
  })
    .then(() => console.log("i18n updated"))
    .catch(error => console.error(error));
}

function refreshSearch() {
  _searchDirty = true;
}

function listUsers() {
  return _users;
}

function listCases() {
  return _cases;
}

function listMethods() {
  return _methods;
}

function listOrganizations() {
  return _organizations;
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

function id(string, field) {
  if (!string) return null;
  if (isObject(string)) {
    string = string.id;
  }
  return parseInt(string);
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
  if (isString(obj)) {
    return obj; // FIXME: test to see if it is a valid key
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

const methodkey = casekeyflat;
const methodkeys = casekeys;

const organizationkey = casekey;
const organizationkeyflat = casekeyflat;
const organizationkeys = casekeys;

function tagkey(obj) {
  if (obj === undefined) {
    throw new Error("Object cannot be undefined for tag");
  }
  if (isString(obj)) {
    if (dbtagkeys.includes(obj)) {
      return obj;
    } else {
      console.warn("failed tag: %s", obj);
      return null;
    }
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

  // if url is not already an amazon url, upload the file
  let url = obj.url;
  // some types of sourced media are links, anything already a link does not need to be uploaded
  if (!url.startsWith("http")) {
    url = uploadToAWS(obj.url, obj.title);
  }

  return [
    '"(',
    asUrl(url),
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
  methodkey,
  methodkeys,
  organizationkey,
  organizationkeyflat,
  organizationkeys,
  richtext,
  tagkeys,
  text,
  url: asUrl,
  urls,
  yesno
});

const helpers = pgp.helpers;

const CASE_BY_ID = sql("../sql/case_by_id.sql");
const METHOD_BY_ID = sql("../sql/method_by_id.sql");
const ORGANIZATION_BY_ID = sql("../sql/organization_by_id.sql");
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
const UPDATE_METHOD = sql("../sql/update_method.sql");
const UPDATE_ORGANIZATION = sql("../sql/update_organization.sql");

module.exports = {
  db,
  as,
  helpers,
  pgp,
  listUsers,
  listCases,
  listMethods,
  listOrganizations,
  refreshSearch,
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
  UPDATE_METHOD,
  UPDATE_ORGANIZATION,
  CASE_BY_ID,
  METHOD_BY_ID,
  ORGANIZATION_BY_ID,
  ErrorReporter
};
