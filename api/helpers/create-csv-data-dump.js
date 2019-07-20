const fs = require("fs");
const { parse } = require("json2csv");
const moment = require("moment");
const {
  db,
  LIST_ARTICLES,
  CASE_BY_ID,
  METHOD_BY_ID,
  ORGANIZATION_BY_ID
} = require("./db.js");

function sanitizeUserName(name) {
  let editedName = name;
  // if the user name is an email address, remove email domain part
  const atSymbolIndex = name.indexOf("@");
  if (atSymbolIndex > 0) {
    editedName = name.substr(0, atSymbolIndex);
  }
  return editedName;
}

async function createCSVDataDump(type) {
  const entries = await db.many(LIST_ARTICLES, {
    type: type + "s",
    lang: "en"
  });

  const sqlForType = {
    case: CASE_BY_ID,
    method: METHOD_BY_ID,
    organization: ORGANIZATION_BY_ID
  };

  const fullEntries = [];
  await Promise.all(
    entries.map(async article => {
      const params = {
        type: type,
        view: "view",
        articleid: article.id,
        lang: "en",
        userid: null
      };
      const articleRow = await db.one(sqlForType[type], params);

      fullEntries.push(articleRow.results);
    })
  );

  const editedEntries = fullEntries.map(entry => {
    const editedEntry = Object.assign({}, entry);
    // add article url
    editedEntry.url = `https://participedia.net/${editedEntry.type}/${
      editedEntry.id
    }`;

    // strip html from body
    editedEntry.body = editedEntry.body.replace(/<\/?[^>]+(>|$)/g, " ");

    // max characters for an excel cell is 32766 so trimming
    // the body length so excel doesn't throw errors
    // https://support.office.com/en-us/article/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
    const MAX_CHAR_LENGTH = 32766;
    if (editedEntry.body && editedEntry.body.length > MAX_CHAR_LENGTH) {
      editedEntry.body = editedEntry.body.substring(0, MAX_CHAR_LENGTH);
    }

    // add creator and last_updated_by name and profile url
    if (editedEntry.creator) {
      editedEntry.creator_id = editedEntry.creator.user_id;
      editedEntry.creator_name = sanitizeUserName(editedEntry.creator.name);
      editedEntry.creator_profile_url = `https://participedia.net/user/${editedEntry.creator.user_id}`;
    }

    if (editedEntry.last_updated_by) {
      editedEntry.last_updated_by_id = editedEntry.last_updated_by.user_id;
      editedEntry.last_updated_by_name = sanitizeUserName(
        editedEntry.last_updated_by.name
      );
      editedEntry.last_updated_by_profile_url = `https://participedia.net/user/${editedEntry.last_updated_by.user_id}`;
    }

    // make sure all date fields are in the same format, ISO 8601
    const dateFields = ["post_date", "updated_date", "start_date", "end_date"];
    dateFields.forEach(field => {
      editedEntry[field] = moment(editedEntry[field]).toISOString();
    });

    // add is_component_of_id, is_component_of_title, is_component_of_url
    // with url of parent component
    if (editedEntry.type === "case" && editedEntry.is_component_of) {
      editedEntry.is_component_of_id = editedEntry.is_component_of.id;
      editedEntry.is_component_of_title = editedEntry.is_component_of.title;
      editedEntry.is_component_of_url =
        `https://participedia.net/${editedEntry.is_component_of.type}/${editedEntry.is_component_of.id}`;
    }

    // primary_organizer
    if (editedEntry.primary_organizer) {
      editedEntry.primary_organizer_id = editedEntry.primary_organizer.id;
      editedEntry.primary_organizer_title = editedEntry.primary_organizer.title;
      editedEntry.primary_organizer_url = `https://participedia.net/${editedEntry.primary_organizer.type}/${editedEntry.primary_organizer.id}`;
    }

    // add counts for media, links and other detailed list fields
    const countFields = [
      "files",
      "links",
      "photos",
      "videos",
      "audio",
      "evaluation_reports",
      "evaluation_links"
    ];
    countFields.forEach(field => {
      if (editedEntry[field]) {
        editedEntry[`${field}_count`] = editedEntry[field].length;
      } else {
        editedEntry[`${field}_count`] = 0;
      }
    });

    // convert specific_methods_tools_techniques, has_components to list of titles
    const articlesToListOfTitles = [
      "has_components",
      "specific_methods_tools_techniques"
    ];
    articlesToListOfTitles.forEach(field => {
      if (editedEntry[field]) {
        editedEntry[field + "_titles"] = editedEntry[field]
          .map(item => item.title)
          .join(", ");
      }
    });

    // convert simple arrays to strings
    const simpleArrayFields = [
      "general_issues",
      "specific_topics",
      "implementers_of_change",
      "change_types",
      "funder_types",
      "organizer_types",
      "insights_outcomes",
      "if_voting",
      "decision_methods",
      "learning_resources",
      "participants_interactions",
      "tools_techniques_types",
      "method_types",
      "targeted_participants",
      "approaches",
      "purposes"
    ];
    simpleArrayFields.forEach(field => {
      editedEntry[field] = editedEntry[field].toString().replace(/,/g, ", ");
    });

    // reorder fields
    const orderOfFields = [
      "id",
      "type",
      "title",
      "url",
      "description",
      "featured",
      "post_date",
      "updated_date",
      "creator_id",
      "creator_name",
      "creator_profile_url",
      "last_updated_by_id",
      "last_updated_by_name",
      "last_updated_by_profile_url",
      "original_language",
      "address1",
      "address2",
      "city",
      "province",
      "postal_code",
      "country",
      "latitude",
      "longitude",
      "is_component_of_id",
      "is_component_of_title",
      "is_component_of_url",
      "specific_methods_tools_techniques_titles",
      "has_components_titles",
      "general_issues",
      "specific_topics",
      "scope_of_influence",
      "start_date",
      "end_date",
      "ongoing",
      "time_limited",
      "purposes",
      "approaches",
      "public_spectrum",
      "number_of_participants",
      "open_limited",
      "recruitment_method",
      "targeted_participants",
      "method_types",
      "tools_techniques_types",
      "legality",
      "facilitators",
      "facilitator_training",
      "facetoface_online_or_both",
      "participants_interactions",
      "learning_resources",
      "decision_methods",
      "if_voting",
      "insights_outcomes",
      "primary_organizer_id",
      "primary_organizer_title",
      "primary_organizer_url",
      "organizer_types",
      "funder",
      "funder_types",
      "staff",
      "volunteers",
      "impact_evidence",
      "change_types",
      "implementers_of_change",
      "formal_evaluation",
      "body",
      "files_count",
      "links_count",
      "photos_count",
      "videos_count",
      "audio_count",
      "evaluation_reports_count",
      "evaluation_links_count"
    ];

    const orderedEntry = {};
    orderOfFields.forEach(field => {
      orderedEntry[field] = editedEntry[field];
    });

    return orderedEntry;
  });

  const fields = Object.keys(editedEntries[0]);

  const opts = { fields };

  const csv = parse(editedEntries, opts);

  const filePath = `./public/participedia-data-${type}s.csv`;

  fs.writeFileSync(filePath, csv);

  return filePath;
}

module.exports = createCSVDataDump;
