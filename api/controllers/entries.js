"use strict";
let express = require("express");
let router = express.Router(); // eslint-disable-line new-cap
let cache = require("apicache");
const caseList = require("./case");
let {
  db,
  as,
  TITLES_FOR_THINGS,
  SEARCH,
  FEATURED_MAP,
  FEATURED,
  SEARCH_MAP,
  ENTRIES_REVIEW_LIST,
  LIST_MAP_CASES,
  LIST_MAP_ORGANIZATIONS,
  SEARCH_CHINESE,
} = require("../helpers/db");

const {
  setConditional,
  maybeUpdateUserText,
  maybeUpdateUserTextLocaleEntry,
  parseGetParams,
  validateUrl,
  isValidDate,
  verifyOrUpdateUrl,
  returnByType,
  fixUpURLs,
  createLocalizedRecord,
  createUntranslatedLocalizedRecords,
  getCollections,
  validateFields,
  parseAndValidateThingPostData,
  getThingEdit,
  validateCaptcha,
  saveDraft,
  generateLocaleArticle,
  searchFiltersFromReq,
  typeFromReq,
  offsetFromReq,
  publishDraft
} = require("../helpers/things");

const {
  caseUpdate,
  getCase
} = require("./case");

const logError = require("../helpers/log-error.js");
const SUPPORTED_LANGUAGES = require("../../constants").SUPPORTED_LANGUAGES
const requireAuthenticatedUser = require("../middleware/requireAuthenticatedUser.js");

const queryFileFromReq = req => {
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


/**
 * @api {get} /review-entries Show all entries that need to be reviewed
 * @apiGroup review-entries
 * @apiVersion 0.1.0
 * @apiName all-review-entries
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {data} User object if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        OK: true
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
 router.get("/review", requireAuthenticatedUser(), async function(req, res) {
    const user_query = req.query.query || "";
    const langQuery = SUPPORTED_LANGUAGES.find(element => element.twoLetterCode === "en").name.toLowerCase();
    const type = typeFromReq(req);

    try {
      let results = await db.any(ENTRIES_REVIEW_LIST, {
        query: user_query,
        limit: null, // null is no limit in SQL
        offset: offsetFromReq(req),
        language: "en",
        langQuery: langQuery,
        userId: req.user ? req.user.id : null,
        sortby: sortbyFromReq(req),
        type: type + "s",
        facets: searchFiltersFromReq(req),
      });
    
        // const data = await getUserById(userId, req, res, "view");
    
        // if (!data) {
        //   return res.status(404).render("404");
        // }
        let data = results;
        // console.log("data review - " + JSON.stringify(results))
    
        // return html template
        const returnType = req.query.returns || "html";
        if (returnType === "html") {
          return res.status(200).render(`review-entries`, {results});
        } else if (returnType === "json") {
          return res.status(200).json(data);
        }
      } catch (error) {
        console.error("Exception in ",  error.message);
        logError(error);
      }
  });

  const updateUser = async (id, currentDate) => {
    try {
      return await db.none(
        "UPDATE users SET accepted_date = ${currentDate} WHERE id = ${id}",
        {
          id: id,
          accepted_date: currentDate,
        }
      );
    } catch (err) {
      console.log("updateUser error - ", err);
    }
  }

  router.get("/reject-review", async function(req, res) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to perform this action." });
    }

    
  });

  router.get("/approve-review", async function(req, res) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to perform this action." });
    }
    const currentDate = new Date();
    await updateUser(user.id, currentDate);

    const params = parseGetParams(req, "case");
    const { articleid, datatype, lang } = params;
    const langErrors = []; 
    const originLang = lang;
    let urlCaptcha = ``;
    let captcha_error_message = "";
    let supportedLanguages;
    
    if(!Object.keys(req.body).length) {
      const articleRow = await (await db.one(CASE_BY_ID, params));
      const article = articleRow.results;

      if (!article.latitude && !article.longitude) {
        article.latitude = '';
        article.longitude = '';
      }

      try {
        supportedLanguages = SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
      } catch (error) {
        supportedLanguages = [];
      }

      var entryLocaleData = {
        title: {},
        description: {},
        body: {},
      };
      var title = {};
      var desc = {};
      var body = {};

      for (let i = 0; i < supportedLanguages.length; i++) {
        const lang = supportedLanguages[i];
        let results = await db.any(LOCALIZED_TEXT_BY_ID_LOCALE, {
          language: lang,
          thingid: article.id
        });

        if (lang === article.original_language) {
          req.body[lang] = article;

          title[lang] = results[0].title;
          desc[lang] = results[0].description;
          body[lang] = results[0].body;

        } else {
          const otherLangArticle = {
            title: (results[0]?.title) ?? '',
            description: results[0]?.description ?? '',
            body: results[0]?.body ?? ''
          };

          if (results[0]?.title) {
            title[lang] = results[0].title;
          }

          if (results[0]?.description) {
            desc[lang] = results[0].description;
          }

          if (results[0]?.body) {
            body[lang] = results[0].body;
          }
          req.body[lang] = otherLangArticle;
        }

        entryLocaleData = {
          title: title,
          description: desc,
          body: body
        };
      }
      
      req.body['entryLocales'] = entryLocaleData;

    }

    //validate captcha start
    try {
      supportedLanguages = SUPPORTED_LANGUAGES.map(locale => locale.twoLetterCode) || [];
    } catch (error) {
      supportedLanguages = [];
    }
    for (let i = 0; i < supportedLanguages.length; i++) {
      const lang = supportedLanguages[i];
      if (req.body[lang]["g-recaptcha-response"]){
        let resKey = req.body[lang]["g-recaptcha-response"];
        captcha_error_message = req.body[lang].captcha_error;
        urlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_SITE_SECRET}&response=${resKey}`;
      }
    }

    let checkReCaptcha = await validateCaptcha(urlCaptcha);
    if (!checkReCaptcha) {
      return res.status(400).json({
        OK: false,
        errors: captcha_error_message,
      });
    }
    //validate captcha end

    if(datatype == 'draft') {
      publishDraft(req, res, caseUpdate, 'case');
      return;
    }
    
    const localeEntries = generateLocaleArticle(req.body, req.body.entryLocales, true);
    let originalLanguageEntry;
    let entryOriginalLanguage;
    const localeEntriesArr = [];

    for (const entryLocale in localeEntries) {
      if (req.body.hasOwnProperty(entryLocale)) {
        const entry = localeEntries[entryLocale];
        
        if (req.body.hasOwnProperty(entry.original_language)){
          entryOriginalLanguage = entry.original_language;
        }
        if (entryLocale === entryOriginalLanguage) {
          originalLanguageEntry = entry;
        }
        
        let errors = validateFields(entry, "case");
        errors = errors.map(e => `${SUPPORTED_LANGUAGES.find(locale => locale.twoLetterCode === entryLocale).name}: ${e}`);
        langErrors.push({ locale: entryLocale, errors });

        if(originLang == entryLocale){
          localeEntriesArr.push(entry)
        }
        await caseUpdate(req, res, entry);
      }
        
    }
    const hasErrors = !!langErrors.find(errorEntry => errorEntry.errors.length > 0);
    if (hasErrors) {
      return res.status(400).json({
        OK: false,
        errors: langErrors,
      });
    }
    
    // if(originalLanguageEntry){
    //   await caseUpdate(req, res, originalLanguageEntry);
    // }
    // const localeEntriesArr = [].concat(...Object.values(localeEntries));
    await createUntranslatedLocalizedRecords(localeEntriesArr, articleid);
    const freshArticle = await getCase(params, res);
    res.status(200).json({
      OK: true,
      article: freshArticle,
    });
    refreshSearch();

    
  });


module.exports = router;