const promise = require("bluebird");
const url = require("url");
const { isArray, isObject, isDate, isString, uniq } = require("lodash");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES.map(
  locale => locale.twoLetterCode
);
const options = {
  // Initialization Options
  promiseLib: promise, // use bluebird as promise library
  capSQL: true, // when building SQL queries dynamically, capitalize SQL keywords
};
const fs = require("fs");

const pgp = require("pg-promise")(options);
const path = require("path");

const connectionString = process.env.DATABASE_URL;

const parse = require("pg-connection-string").parse;
let config;
const {uploadToAWS} = require("./upload-to-aws.js");
const logError = require("./log-error.js");

try {
  config = parse(connectionString);
  if (process.env.NODE_ENV === "test" || config.host === "localhost") {
    config.ssl = false;
  } else {
    config.ssl = {
      rejectUnauthorized: false, // Required for Heroku
    };
    // config.ssl = {
    //   sslmode: "require",
    //   rejectUnauthorized: false,
    // };
  }
} catch (e) {
  console.error("# Error parsing DATABASE_URL environment variable");
}


let db = pgp(config);
console.log("db db db db ^^^^^^^^^^^^^^^^^^^^^^^^ db ", db)

const i18n_en = JSON.parse(fs.readFileSync("locales/en.js"));

function i10n(lang) {
  return JSON.parse(fs.readFileSync(`locales/${lang}.js`));
}

function sql(filename) {
  return new pgp.QueryFile(path.join(__dirname, filename), {
    minify: true,
  });
}

const COLLECTION_BY_ID = sql("../sql/collection_by_id.sql");
const COLLECTION_BY_ID_LOCALE = sql("../sql/collection_by_id_locale.sql");
const COLLECTIONS = sql("../sql/collections.sql");
const CASE_BY_ID = sql("../sql/case_by_id.sql");
const CASE_BY_ID_GET = sql("../sql/case_by_id_get.sql");
const CASES_LOCALE_BY_ID = sql("../sql/case_by_id_locale_array_2.sql");
const METHOD_BY_ID = sql("../sql/method_by_id.sql");
const METHODS_LOCALE_BY_ID = sql("../sql/method_by_id_locale.sql");
const ORGANIZATION_BY_ID = sql("../sql/organization_by_id.sql");
const ORGANIZATION = sql("../sql/organization.sql");
const ORGANIZATION_LOCALE_BY_ID = sql("../sql/organization_by_id_locale.sql");
const INSERT_LOCALIZED_TEXT = sql("../sql/insert_localized_text.sql");
const UPDATE_DRAFT_LOCALIZED_TEXT = sql(
  "../sql/update_draft_localized_text.sql"
);
const LOCALIZED_TEXT_BY_ID_LOCALE = sql(
  "../sql/localized_text_by_id_locale.sql"
);
const LOCALIZED_TEXT_BY_ID_LOCALE_NO_LIMIT = sql(
  "../sql/localized_text_by_id_locale_no_limit.sql"
);
const LOCALIZED_TEXT_BY_THING_ID = sql("../sql/localized_text_by_thing_id.sql");
const UPDATE_NOUN = sql("../sql/update_noun.sql");
const INSERT_AUTHOR = sql("../sql/insert_author.sql");
const USER_BY_EMAIL = sql("../sql/user_by_email.sql");
const USER_BY_ID = sql("../sql/user_by_id.sql");
const USER_DELETE = sql("../sql/user_delete.sql");
const LIST_USER = sql("../sql/user.sql");
const CREATE_USER_ID = sql("../sql/create_user_id.sql");
const CASES_BY_COUNTRY = sql("../sql/cases_by_country.sql");
const CREATE_COLLECTION = sql("../sql/create_collection.sql");
const CREATE_CASE = sql("../sql/create_case.sql");
const CASE = sql("../sql/case.sql");
const METHOD = sql("../sql/method.sql");
const CREATE_METHOD = sql("../sql/create_method.sql");
const CREATE_ORGANIZATION = sql("../sql/create_organization.sql");
const TITLES_FOR_THINGS = sql("../sql/titles_for_things.sql");
const SEARCH = sql("../sql/search.sql");
const SEARCH_CASE_DOWNLOAD = sql("../sql/search_case_download.sql");
const SEARCH_CHINESE = sql("../sql/search_chinese.sql");
const FEATURED_MAP = sql("../sql/featuredmap.sql");
const FEATURED = sql("../sql/featured.sql");
const FEATURED_COLLECTION = sql("../sql/featured_collection.sql");
const SEARCH_MAP = sql("../sql/searchmap.sql");
const LIST_ARTICLES = sql("../sql/list_articles.sql");
const LIST_MAP_CASES = sql("../sql/list_map_cases.sql");
const LIST_MAP_ORGANIZATIONS = sql("../sql/list_map_orgs.sql");
const LIST_TITLES = sql("../sql/list_titles.sql");
const LIST_SHORT = sql("../sql/list_short.sql");
const UPDATE_USER = sql("../sql/update_user.sql");
const UPDATE_CASE = sql("../sql/update_case.sql");
const UPDATE_COLLECTION = sql("../sql/update_collection.sql");
const UPDATE_METHOD = sql("../sql/update_method.sql");
const UPDATE_ORGANIZATION = sql("../sql/update_organization.sql");
const UPDATE_AUTHOR_FIRST = sql("../sql/update_author_first.sql");
const UPDATE_AUTHOR_LAST = sql("../sql/update_author_last.sql");
const ENTRIES_BY_COLLECTION_ID = sql("../sql/entries_by_collection_id.sql");
const ENTRIES_SUMMARY_BY_COLLECTION_ID = sql(
  "../sql/entries_summary_by_collection_id.sql"
);
const ENTRIES_REVIEW_LIST = sql("../sql/entries_review_list.sql");
const ENTRIES_BY_USER = sql("../sql/entries_by_user.sql");
const AUTHOR_BY_ENTRY = sql("../sql/author_by_entry.sql");
const ENTRY_REVIEW = sql("../sql/entries-review.sql");
const SEARCH_CASES = sql("../sql/search_cases.sql");
const SEARCH_METHODS = sql("../sql/search_methods.sql");
const SEARCH_ORGANIZATIONS = sql("../sql/search_organizations.sql");
const CREATE_CSV_EXPORT = sql("../sql/create_csv_export.sql");
const UPDATE_CSV_EXPORT = sql("../sql/update_csv_export.sql");
const REMOVE_CSV_EXPORT = sql("../sql/remove_csv_export.sql");
const CSV_EXPORT = sql("../sql/csv_export.sql");
const SEARCH_ORGANIZATION_DOWNLOAD = sql("../sql/search_organizations_download.sql");
const UPSERT_MEDIUM_POST = sql("../sql/upsert_medium_post.sql");
const MEDIUM_POSTS = sql("../sql/medium_posts.sql");
const COPY_CASE = sql("../sql/copy_case.sql");
const CASE_BY_ORGINAL_ENTRY_ID = sql("../sql/case_by_orginal_entry_id.sql");
const DELETE_EDITED_CASE_ENTRY = sql("../sql/delete_edited_case_entry.sql");
const LOCALIZED_TEXT_BY_THINGID_ORDERBY = sql("../sql/localized_text_by_thingid_no_limit.sql");
const THING_BY_ORGINAL_ENTRY_ID = sql("../sql/things_by_orginal_entry_id.sql");
const COPY_METHOD = sql("../sql/copy_method.sql");
const DELETE_EDITED_METHODS_ENTRY = sql("../sql/delete_edited_method_entry.sql");
const DELETE_EDITED_ORGANIZATION_ENTRY = sql("../sql/delete_edited_organization_entry.sql");
const COPY_ORGANIZATION = sql("../sql/copy_organization.sql");


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
        logError(`ErrorReporter: ${e.message}`);
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
let _cases = {};
let _methods = {};
let _organizations = {};
let _searchDirty = true;

async function _listUsers() {
  _users = (
    await db.one(
      "SELECT to_json(array_agg((id, name)::object_title)) AS authors FROM users;"
    )
  ).authors;
  setTimeout(_listUsers, randomDelay());
}

async function _listCases(lang) {
  try {
    _cases[lang] = await db.many(LIST_ARTICLES, { type: "cases", lang: lang });
  } catch (e) {
    logError(`Error in _listCases: ${e.message}`);
  }
  setTimeout(_listCases, randomDelay(), lang);
}

async function _listMethods(lang) {
  _methods[lang] = await db.many(LIST_ARTICLES, {
    type: "methods",
    lang: lang,
  });
  setTimeout(_listMethods, randomDelay(), lang);
}

async function _listOrganizations(lang) {
  _organizations[lang] = await db.many(LIST_ARTICLES, {
    type: "organizations",
    lang: "en",
  });
  setTimeout(_listOrganizations, randomDelay(), lang);
}

async function _refreshSearch() {
  if (_searchDirty) {
    _searchDirty = false;
    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      let lang = SUPPORTED_LANGUAGES[i];
      if (lang !== "zh") {
        await db.none(`REFRESH MATERIALIZED VIEW search_index_${lang};`);
      }
    }
  }
  setTimeout(_refreshSearch, randomDelay());
}

async function cacheTitlesRefreshSearch(done) {
  // if (!process.env.MIGRATIONS) {
  if (process.env.NODE_ENV === "test") {
    await _listUsers();
    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      let lang = SUPPORTED_LANGUAGES[i];
      await _listCases(lang).then(() => console.log("%s cases cached", lang));
      await _listMethods(lang).then(() =>
        console.log("%s methods cached", lang)
      );
      await _listOrganizations(lang).then(() =>
        console.log("%s organizations cached", lang)
      );
    }
  } else {
    _listUsers();
    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      let lang = SUPPORTED_LANGUAGES[i];
      _listCases(lang).then(() => console.log("%s cases cached", lang));
      _listMethods(lang).then(() => console.log("%s methods cached", lang));
      _listOrganizations(lang).then(() =>
        console.log("%s organizations cached", lang)
      );
    }
  }
  // keep running these, but we can start the server now
  _refreshSearch().then(() => console.log("search refreshed"));

  for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    let lang = SUPPORTED_LANGUAGES[i];
    db.none(
      "UPDATE localizations SET keyvalues = ${keys}" +
        `WHERE language='${lang}'`,
      {
        keys: i10n(lang),
      }
    ).then(() => console.log(`i18n ${lang} updated`));
  }
  if (done) {
    done();
  }
}

function refreshSearch() {
  _searchDirty = true;
}

function listUsers() {
  return _users;
}

function listCases(lang) {
  return _cases[lang];
}

function listMethods(lang) {
  return _methods[lang];
}

function listOrganizations(lang) {
  return _organizations[lang];
}

// as.number, enhances existing as.number to cope with numbers as strings
function number(value) {
  if (value === "") {
    return null;
  }
  let numValue = Number(value);
  if (Number.isNaN(numValue)) {
    return numValue;
  }
  return pgp.as.number(Number(value));
}

function integer(value) {
  if (value === "") {
    return null;
  }
  let intValue = parseInt(value, 10);
  if (Number.isNaN(intValue)) {
    return intValue;
  }
  return pgp.as.number(intValue);
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
    logError(`Expecting URL, received: ${value}`);
    throw new Error("Not a URL: " + value);
    return escapedText("");
  }
  try {
    if (!value.startsWith("http")) {
      value = "https://" + value;
    }
    // return new URL(value).href;
    return escapedText(new URL(value).href);
  } catch (e) {
    logError(`Expecting URL, received: ${value}`);
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
  if (idList.length && isObject(idList[0])) {
    return idList.map(item => parseInt(item.id, 10));
  }
  // filter out empty values and map to integers
  return idList.filter(item => item !== "").map(item => parseInt(item, 10));
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
    logError(
      `Error attempting to convert and filter a list of keys for ${group}`
    );
    throw e;
  }
}

const methodkey = casekeyflat;
const methodkeys = casekeys;

const organizationkey = casekey;
const organizationkeyflat = casekeyflat;
const organizationkeys = casekeys;

function FullFile(obj) {
  this.rawType = true;
  this.toPostgres = () =>
    pgp.as.format(
      "(${url}, ${source_url}, ${attribution}, ${title})::full_file",
      obj
    );
}

function FullLink(obj) {
  this.rawType = true;
  this.toPostgres = () =>
    pgp.as.format("(${url}, ${attribution}, ${title})::full_link", obj);
}

function aMedium(obj) {
  if (isString(obj)) {
    obj = { url: obj, attribution: "", title: "" };
  }
  if (!obj.url) return null;
  return new FullLink(obj);
}

function aSourcedMedia(obj) {
  if (isString(obj)) {
    obj = { url: obj, source_url: "", attribution: "", title: "" };
  }
  if (!obj.url) return null;

  // if url is not already an amazon url, upload the file
  let url = obj.url;
  // some types of sourced media are links, anything already a link does not need to be uploaded
  if (!obj.url.startsWith("http")) {
    obj.url = uploadToAWS(obj.url);
  }
  return new FullFile(obj);
}

function media(mediaList) {
  return (mediaList || []).map(aMedium).filter(x => !!x); // remove nulls
}

function sourcedMedia(mediaList) {
  return (mediaList || []).map(aSourcedMedia).filter(x => !!x); // remove nulls
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

function selectBoolean(value) {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  } else {
    return null;
  }
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
  selectBoolean,
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
  text,
  url: asUrl,
  urls,
  yesno,
});

const helpers = pgp.helpers;

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
  cacheTitlesRefreshSearch,
  INSERT_LOCALIZED_TEXT,
  UPDATE_DRAFT_LOCALIZED_TEXT,
  LOCALIZED_TEXT_BY_ID_LOCALE,
  LOCALIZED_TEXT_BY_ID_LOCALE_NO_LIMIT,
  LOCALIZED_TEXT_BY_THING_ID,
  UPDATE_NOUN,
  INSERT_AUTHOR,
  USER_BY_EMAIL,
  USER_BY_ID,
  USER_DELETE,
  LIST_USER,
  CREATE_USER_ID,
  CASES_BY_COUNTRY,
  CREATE_COLLECTION,
  CREATE_CASE,
  CREATE_METHOD,
  CREATE_ORGANIZATION,
  TITLES_FOR_THINGS,
  SEARCH,
  SEARCH_CHINESE,
  SEARCH_CASE_DOWNLOAD,
  FEATURED_MAP,
  FEATURED,
  FEATURED_COLLECTION,
  SEARCH_MAP,
  LIST_ARTICLES,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
  LIST_TITLES,
  LIST_SHORT,
  UPDATE_USER,
  UPDATE_CASE,
  UPDATE_COLLECTION,
  UPDATE_METHOD,
  UPDATE_ORGANIZATION,
  COLLECTION_BY_ID_LOCALE,
  COLLECTION_BY_ID,
  COLLECTIONS,
  CASE_BY_ID,
  CASE_BY_ID_GET,
  CASE,
  CASES_LOCALE_BY_ID,
  METHOD_BY_ID,
  METHOD,
  METHODS_LOCALE_BY_ID,
  ORGANIZATION_BY_ID,
  ORGANIZATION,
  ORGANIZATION_LOCALE_BY_ID,
  UPDATE_AUTHOR_FIRST,
  UPDATE_AUTHOR_LAST,
  ENTRIES_BY_COLLECTION_ID,
  ENTRIES_SUMMARY_BY_COLLECTION_ID,
  ENTRIES_REVIEW_LIST,
  ENTRIES_BY_USER,
  AUTHOR_BY_ENTRY,
  ENTRY_REVIEW,
  SEARCH_CASES,
  SEARCH_METHODS,
  SEARCH_ORGANIZATIONS,
  CREATE_CSV_EXPORT,
  UPDATE_CSV_EXPORT,
  REMOVE_CSV_EXPORT,
  CSV_EXPORT,
  SEARCH_ORGANIZATION_DOWNLOAD,
  ErrorReporter,
  UPSERT_MEDIUM_POST,
  MEDIUM_POSTS,
  COPY_CASE,
  CASE_BY_ORGINAL_ENTRY_ID,
  DELETE_EDITED_CASE_ENTRY,
  LOCALIZED_TEXT_BY_THINGID_ORDERBY,
  THING_BY_ORGINAL_ENTRY_ID,
  COPY_METHOD,
  DELETE_EDITED_METHODS_ENTRY,
  DELETE_EDITED_ORGANIZATION_ENTRY,
  COPY_ORGANIZATION
};