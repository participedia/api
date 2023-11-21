let {
  db,
  as,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
  SEARCH_CASE_DOWNLOAD,
  SEARCH_ORGANIZATION_DOWNLOAD,
  SEARCH_CHINESE,
  ENTRIES_BY_COLLECTION_ID,
} = require("./db");

const {
  supportedTypes,
  parseGetParams,
  searchFiltersFromReq,
  typeFromReq,
  limitFromReq,
  offsetFromReq
} = require("./things");

const is_whitespace = str => /^\s+$/.test(str);

const is_word = str => /^[A-Z0-9a-zÀ-ÿ]+$/.test(str);

const pre_word_connector = (last_token, inside_quotes) => {
  if (last_token === "WORD") {
    if (inside_quotes) {
      return "<->";
    } else {
      return "&";
    }
  } else {
    return "";
  }
};

const tokenize = function*(query, inside_quotes = false) {
  let re = /".*?"|[A-Z0-9a-zÀ-ÿ]+|<->|&|\||\!|\(|\)/g;
  let last_token = null;
  let tokenObj = null;
  while ((tokenObj = re.exec(query)) !== null) {
    let token = tokenObj[0];
    if (token[0] === '"') {
      yield pre_word_connector(last_token, inside_quotes);
      for (t of tokenize(token.slice(1, -1), true)) {
        yield t;
      }
      last_token = "WORD";
    } else if (token === "and" || token === "&") {
      last_token = "CONNECT";
      yield "&";
    } else if (token === "or" || token === "|") {
      last_token = "CONNECT";
      yield "|";
    } else if (token === "not" || token === "!") {
      if (last_token === "WORD") {
        yield "&"; // cannot have a bare NOT, needs a connector
      }
      last_token = "CONNECT";
      yield "!";
    } else if (token === "<->") {
      last_token = "CONNECT";
      yield token;
    } else if (token === "(") {
      yield pre_word_connector(last_token, inside_quotes);
      last_token = "CONNECT";
      yield token;
    } else if (token === ")") {
      last_token = "WORD";
      yield token;
    } else if (is_word(token)) {
      yield pre_word_connector(last_token, inside_quotes);
      last_token = "WORD";
      yield token;
    }
  }
};

const preparse_query = (userQuery) => {
  userQuery = userQuery.replace(/[{()}]/g, "");
  return [...tokenize(userQuery.toLowerCase())].join("");
};

const queryFileFromReq = (req) => {
  const featuredOnly =
    !req.query.query || (req.query.query || "").toLowerCase() === "featured";
  const resultType = (req.query.resultType || "").toLowerCase();
  let queryfile = SEARCH;
  if (featuredOnly && resultType === "map") {
    queryfile = FEATURED_MAP;
  } else if (featuredOnly) {
    queryfile = FEATURED;
  } else if (resultType == "map") {
    queryfile = SEARCH_MAP;
  }
  return queryfile;
};

const sortbyFromReq = req => {
  if (req.query.sortby === "post_date") {
    return "post_date";
  }
  return "updated_date";
};

const getSearchResults = async (user_query, limit, langQuery, lang, type, parsed_query, req) => {
  try {
    let results = null;
    
    if (lang === "zh" && user_query) {
      results = await db.any(SEARCH_CHINESE, {
        query: user_query,
        limit: limit ? limit : null,
        langQuery: langQuery,
        language: lang,
        type: type + "s",
      });
    } else {
      results = await db.any(queryFileFromReq(req), {
        query: parsed_query,
        limit: limit ? limit : null, // null is no limit in SQL
        offset: offsetFromReq(req),
        language: lang,
        langQuery: langQuery,
        userId: req.user ? req.user.id : null,
        sortby: sortbyFromReq(req),
        type: type + "s",
        facets: searchFiltersFromReq(req),
      });
    }
    return results;
  } catch (err) {
    console.log("getSearchResults error - ", err);
  }
}

const getSearchDownloadResults = async (params) => {
  try {
    let results = null;
    let queryFile = SEARCH;
    switch (params.type) {
      case "case":
        queryFile = SEARCH_CASE_DOWNLOAD;
        break;
      case "method":
        // await removeEntryMethods(thingsByUser.id);
        break;
      case "collection":
        // await removeEntryCollections(thingsByUser.id);
        break;
      case "organization":
        queryFile = SEARCH_ORGANIZATION_DOWNLOAD;
        // await removeEntryOrganizations(thingsByUser.id);
        break;
    }
    
    if (params.lang === "zh" && params.user_query) {
      results = await db.any(SEARCH_CHINESE, {
        query: params.user_query,
        limit: params.limit,
        langQuery: params.langQuery,
        language: params.lang,
        type: params.type + "s",
      });
    } else {
      const filters = {
        query: params.parsed_query,
        limit: params.limit, // null is no limit in SQL
        offset: offsetFromReq(params.req),
        language: params.lang,
        langQuery: params.langQuery,
        userId: params.req.user ? params.req.user.id : null,
        sortby: sortbyFromReq(params.req),
        type: params.type + "s",
        facets: searchFiltersFromReq(params.req),
      }
      results = await db.any(queryFile, filters);
    }
    return results;
  } catch (err) {
    console.log("getSearchDownloadResults error - ", err);
  }
}

const getCollectionResults = async (params) => {
  try {
    let results = await db.any(ENTRIES_BY_COLLECTION_ID, {
      query: params.query,
      limit: params.limit, // null is no limit in SQL
      offset: params.offset,
      language: params.language,
      sortby: params.sortby,
      userId: params.userId,
      types: params.types,
      facets: params.facets
    });
    return results;
  } catch (err) {
    console.log("getCollectionResults error - ", err);
  }
}


module.exports = {
  preparse_query,
  tokenize,
  queryFileFromReq,
  getSearchResults,
  getSearchDownloadResults,
  getCollectionResults
};
