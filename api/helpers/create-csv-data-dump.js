const fs = require("fs");
const { parse } = require("json2csv");
const moment = require("moment");
const {
  db,
  LIST_ARTICLES,
  CASE_BY_ID,
  METHOD_BY_ID,
  ORGANIZATION_BY_ID,
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

function generateMultiSelectFieldColumn(field, stringArrayValue) {
  const items = stringArrayValue.split(",");
  const length = items.length;
  let newObj = Object.create({});

  for (let i = 0; i < length; i++) {
    newObj[`${field}_${i+1}`] = items[i];
  }
  
  return newObj;
}

function generateCsvFields(orderFields, multiFieldArray, editedFields) {
  let csvFields = Object.create({});
  orderFields.forEach(field => {
    if (multiFieldArray.indexOf(field) >= 0) {
      for (let i = 0; i < 5; i++) {
        let multiField = `${field}_${i+1}`;
        if (editedFields.hasOwnProperty(multiField)) {
          csvFields[multiField] = true;
        }
      }
    } else {
      csvFields[field] = true;
    }
  });
  return csvFields;
}

const orderedCaseFields = [
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
  "evaluation_links_count",
  "collections"
];

const orderedMethodFields = [
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
  "facilitators",
  "facetoface_online_or_both",
  "public_spectrum",
  "open_limited",
  "recruitment_method",
  "level_polarization",
  "level_complexity",
  "method_types",
  "number_of_participants",
  "scope_of_influence",
  "participants_interactions",
  "decision_methods",
  "if_voting",
  "purpose_method",
  "body",
  "photos_count",
  "files_count",
  "videos_count",
  "links_count",
  "audio_count",
  "collections"
];

const orderedOrganizationFields = [
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
  "sector",
  "scope_of_influence",
  "type_method",
  "type_tool",
  "specific_topics",
  "general_issues",
  "specific_methods_tools_techniques",
  "body",
  "photos_count",
  "files_count",
  "videos_count",
  "links_count",
  "audio_count",
  "collections"
];

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
  "purposes",
  "number_of_participants",
  "scope_of_influence",
  "purpose_method",
  "type_method",
  "type_tool",
];

const orderedFieldsByType = {
  case: orderedCaseFields,
  method: orderedMethodFields,
  organization: orderedOrganizationFields,
};

function convertToIdTitleUrlFields(entry, field) {
  if (entry[field]) {
    entry[`${field}_id`] = entry[field].id;
    entry[`${field}_title`] = entry[field].title;
    entry[`${field}_url`] = `https://participedia.net/${entry[field].type}/${
      entry[field].id
    }`;
  }
  return entry;
}

async function createCSVDataDump(type, results = []) {
  var entries = results;
  var csvFields = Object.create({});

  const sqlForType = {
    case: CASE_BY_ID,
    method: METHOD_BY_ID,
    organization: ORGANIZATION_BY_ID,
  };

  const fullEntries = [];
  await Promise.all(
    entries.map(async article => {
      let articleType = type == 'thing' ? article.type : type;
      if (articleType !== 'collection') {
        const params = {
          type: articleType,
          view: "view",
          articleid: article.id,
          lang: "en",
          userid: null,
        };
        const articleRow = await db.one(sqlForType[articleType], params);

        fullEntries.push(articleRow.results);
      }
    })
  );

  const editedEntries = fullEntries.map(entry => {
    let editedEntry = Object.assign({}, entry);
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
      editedEntry.creator_profile_url = `https://participedia.net/user/${
        editedEntry.creator.user_id
      }`;
    }

    if (editedEntry.last_updated_by) {
      editedEntry.last_updated_by_id = editedEntry.last_updated_by.user_id;
      editedEntry.last_updated_by_name = sanitizeUserName(
        editedEntry.last_updated_by.name
      );
      editedEntry.last_updated_by_profile_url = `https://participedia.net/user/${
        editedEntry.last_updated_by.user_id
      }`;
    }

    // make sure all date fields are in the same format, ISO 8601
    const dateFields = ["post_date", "updated_date", "start_date", "end_date"];
    dateFields.forEach(field => {
      editedEntry[field] = moment(editedEntry[field]).isValid() ? moment(editedEntry[field]).format("YYYY-MM-DD") : "";
    });

    const booleanFields = ["featured", "ongoing", "staff", "volunteers"];
    booleanFields.forEach(field => {
      if (editedEntry[field] !== undefined) {
        editedEntry[field] = editedEntry[field] ? 1 : 0;
      }
    });

    const yesOrNoFields = ["legality", "facilitators", "impact_evidence", "formal_evaluation"];
    yesOrNoFields.forEach(field => {
      if (editedEntry[field] !== undefined) {
        if (editedEntry[field] == "yes" || editedEntry[field] == "no") {
          editedEntry[field] = editedEntry[field] == "yes" ? 1 : 0;
        }
      }
    });

    // convert primary_organizer and is_component_of into three new fields (id, title, url)
    if (editedEntry.type === "case") {
      editedEntry = convertToIdTitleUrlFields(editedEntry, "is_component_of");
      editedEntry = convertToIdTitleUrlFields(editedEntry, "primary_organizer");
    }

    // convert specific_methods_tools_techniques into three new fields (id, title, url)
    if (editedEntry.type === "organization") {
      editedEntry = convertToIdTitleUrlFields(
        editedEntry,
        "specific_methods_tools_techniques"
      );
    }

    // add counts for media, links and other detailed list fields
    const countFields = [
      "files",
      "links",
      "photos",
      "videos",
      "audio",
      "evaluation_reports",
      "evaluation_links",
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
      "specific_methods_tools_techniques",
    ];
    articlesToListOfTitles.forEach(field => {
      if (editedEntry[field]) {
        editedEntry[`${field}_titles`] = editedEntry[field]
          .map(item => item.title)
          .join(", ");
      }
    });

    simpleArrayFields.forEach(field => {
      if (editedEntry[field]) {
        editedEntry[field] = editedEntry[field].toString().replace(/,/g, ", ");
      }
    });

    // Add "Collections" column
    if (editedEntry.collections) {
      let collections = editedEntry.collections.map(collection => {
        return collection.title;
      });

      editedEntry.collections = collections.toString();
    }
    
    // reorder fields
    const orderOfFields = orderedFieldsByType[editedEntry.type];

    const orderedEntry = {};
    orderOfFields.forEach(field => {
      if (simpleArrayFields.indexOf(field) >= 0) {
        if (editedEntry[field]) {
          let object = generateMultiSelectFieldColumn(field, editedEntry[field]);
          Object.keys(object).forEach(key => {
            orderedEntry[key] = object[key];
            csvFields[key] = true;
          });
        }
      } else {
        orderedEntry[field] = editedEntry[field];
        csvFields[field] = true;
      }
    });

    return orderedEntry;
  });
  
  if (type === "thing") {
    csvFields = editedEntries[0];
  } else {
    csvFields = generateCsvFields(orderedFieldsByType[type], simpleArrayFields, csvFields);
  }

  const fields = Object.keys(csvFields);

  const opts = { fields };

  const csv = parse(editedEntries, opts);

  const filePath = `./public/participedia-data-${type}s.csv`;

  fs.writeFileSync(filePath, csv);

  return filePath;
}

module.exports = createCSVDataDump;
