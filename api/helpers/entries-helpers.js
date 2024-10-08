"use strict";
let express = require("express");

let {
  db,
  AUTHOR_BY_ENTRY,
  ENTRIES_BY_USER,
  LOCALIZED_TEXT_BY_THING_ID,
  LOCALIZED_TEXT_BY_ID_LOCALE
} = require("../helpers/db");

const publishHiddenEntry = async entryId => {
  try {
    return await db.none(
      "UPDATE things SET hidden = false WHERE id = ${entryId}",
      {
        entryId: entryId,
      }
    );
  } catch (err) {
    console.log("publishHiddenEntry error - ", err);
  }
};

const removeEntryThings = async entryId => {
  try {
    return await db.none("DELETE FROM things WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryThings error - ", err);
  }
};

const getEntryOriginLang = async entryId => {
  try {
    return await db.one("SELECT original_language,type,orginal_entry_id FROM things WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryThings error - ", err);
  }
};

const removeEntryCases = async entryId => {
  try {
    return await db.none("DELETE FROM cases WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryCases error - ", err);
  }
};

const removeEntryMethods = async entryId => {
  try {
    return await db.none("DELETE FROM methods WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryMethods error - ", err);
  }
};

const removeEntryOrganizations = async entryId => {
  try {
    return await db.none("DELETE FROM organizations WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryOrganizations error - ", err);
  }
};

const removeEntryCollections = async entryId => {
  try {
    return await db.none("DELETE FROM collections WHERE id = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeEntryCollections error - ", err);
  }
};

const removeAuthor = async entryId => {
  try {
    return await db.none("DELETE FROM authors WHERE thingid = ${entryId}", {
      entryId: entryId,
    });
  } catch (err) {
    console.log("removeAuthor error - ", err);
  }
};

const removeAuthorByUserId = async userId => {
  try {
    return await db.none("DELETE FROM authors WHERE user_id = ${userId}", {
      userId: userId,
    });
  } catch (err) {
    console.log("removeAuthor error - ", err);
  }
};

const removeLocalizedText = async entryId => {
  try {
    return await db.none(
      "DELETE FROM localized_texts WHERE thingid = ${entryId}",
      {
        entryId: entryId,
      }
    );
  } catch (err) {
    console.log("removeLocalizedText error - ", err);
  }
};

const getApprovalUserPost = async user_id => {
  try {
    let results = await db.any(ENTRIES_BY_USER, {
      user_id: user_id,
      post_date: "2022-12-01",
    });
    return results;
  } catch (err) {
    console.log("getApprovalUserPost error - ", err);
  }
};

const getRejectionUserPost = async user_id => {
  try {
    let results = await db.any(ENTRIES_BY_USER, {
      user_id: user_id,
      post_date: "2000-01-01",
    });
    return results;
  } catch (err) {
    console.log("getRejectionUserPost error - ", err);
  }
};

const getAuthorByEntry = async entryId => {
  try {
    let results = await db.one(AUTHOR_BY_ENTRY, {
      entry_id: entryId,
    });
    return results;
  } catch (err) {
    console.log("getAuthorByEntry error - ", err);
  }
};

const getOriginLanguageEntry = async (thingid, originLang) => {
  try {
    let results = await db.one(LOCALIZED_TEXT_BY_ID_LOCALE, {
      thingid: thingid,
      language: originLang,
    });
    return results;
  } catch (err) {
    console.log("getOriginLanguageEntry error - ", err);
  }
};

const getEntryByThingidAndLang = async (thingid, originLang) => {
  try {
    let results = await db.one(LOCALIZED_TEXT_BY_ID_LOCALE, {
      thingid: thingid,
      language: originLang,
    });
    return results;
  } catch (err) {
    console.log("getEntryByThingidAndLang error - ", err);
    return null
  }
};


module.exports = {
  publishHiddenEntry,
  removeEntryThings,
  removeEntryCases,
  removeEntryMethods,
  removeEntryCollections,
  removeEntryOrganizations,
  removeAuthor,
  removeLocalizedText,
  getApprovalUserPost,
  getRejectionUserPost,
  getAuthorByEntry,
  getOriginLanguageEntry,
  getEntryOriginLang,
  removeAuthorByUserId,
  getEntryByThingidAndLang
};
