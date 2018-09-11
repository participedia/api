const fs = require("fs");

const splitOnce = (str, sep) => {
  let vals = str.split(sep);
  let key = vals.shift();
  let val = vals.join(sep).trim();
  let ret = [key, val];
  return ret;
};

const original = fs.readFileSync("migrations/backend_case_edit.csv", "utf8");
const lines = original.split("\n");
lines.pop(); // get rid of blank trailing line
const lookup = {};
pairs = lines.map(line => splitOnce(line, ","));
for (let i = 0; i < pairs.length; i++) {
  if (pairs[i].length !== 2) {
    throw new Exception();
  }
  let [key, value] = pairs[i];
  if (lookup[key]) {
    throw new Exception(`Duplicate key: ${key}`);
  }
  lookup[key] = value;
}

const all_keys = pairs.map(pair => pair[0]);

const all_labels = all_keys.filter(key => key.endsWith("_label"));
const all_instructional = all_keys.filter(key =>
  key.endsWith("_instructional")
);
const all_info = all_keys.filter(key => key.endsWith("_info"));
const all_placeholder = all_keys.filter(key => key.endsWith("_placeholder"));
const all_sections = all_keys.filter(key => key.endsWith("_sectionlabel"));
const all_values = all_keys.filter(key => key.includes("_value_"));
const value_fields = {};
all_values.forEach(key => {
  let [field, name] = key.split("_value_");
  if (!value_fields[field]) {
    value_fields[field] = [];
  }
  value_fields[field].push(name);
});
const other = all_keys.filter(
  key =>
    !all_labels.includes(key) &&
    !all_instructional.includes(key) &&
    !all_info.includes(key) &&
    !all_placeholder.includes(key) &&
    !all_sections.includes(key) &&
    !all_values.includes(key)
);
// console.log("other: %o", other);

// console.log("all keys: %s", all_keys.length);
// console.log(
//   "all subsets: %s",
//   all_labels.length +
//     all_instructional.length +
//     all_info.length +
//     all_placeholder.length +
//     all_sections.length +
//     all_values.length
// );

function createCaseStaticTable() {
  console.log("CREATE TABLE case_static_localized (");
  console.log("  language TEXT NOT NULL,");
  all_labels.forEach(label => {
    let key = label.slice(0, -6);
    console.log("  -- %s fields", key);
    console.log("  %s TEXT DEFAULT 'Localized %s',", label, label);
    console.log(
      "  %s TEXT DEFAULT 'Localized %s',",
      key + "_instructional",
      key + "_instructional"
    );
    console.log("  %s TEXT DEFAULT ''::text,", key + "_info");
    console.log(
      "  %s TEXT DEFAULT 'Localized %s',",
      key + "_placeholder",
      key + "_placeholder"
    );
  });
  console.log(");\n");
}

function importCaseStaticTable() {
  console.log("INSERT INTO case_static_localized VALUES (");
  console.log("  'en',");
  all_labels.forEach(label => {
    let key = label.slice(0, -6);
    console.log("  '%s',", lookup[label].replace("'", "''"));
    console.log("  '%s',", lookup[key + "_instructional"].replace("'", "''"));
    console.log(
      "  '%s',",
      lookup[key + "_info"].replace("null", "").replace("'", "''")
    );
    console.log("  '%s',", lookup[key + "_placeholder"].replace("'", "''"));
  });
  console.log(");\n");
}

function createSectionsStaticTable() {
  console.log("CREATE TABLE sections_static_localized (");
  console.log("  language TEXT NOT NULL,");
  all_sections.forEach(section => {
    console.log("  %s TEXT DEFAULT 'Localized %s',", section, section);
  });
  console.log(");\n");
}

function importSectionStaticTable() {
  console.log("INSERT INTO sections_static_localized VALUES (");
  console.log("  'en',");
  all_sections.forEach(section =>
    console.log("  '%s',", lookup[section].replace("'", "''"))
  );
  console.log(");");
}

function createValueStaticTables() {
  Object.keys(value_fields).forEach(field => {
    console.log("CREATE TABLE %s_case_value_localized (", field);
    console.log("  language TEXT NOT NULL,");
    value_fields[field].forEach(value_key => {
      console.log(
        "  %s_long TEXT DEFAULT 'Localized %s long form',",
        value_key,
        value_key
      );
      console.log(
        "  %s_short TEXT DEFAULT 'Localized %s short form',",
        value_key,
        value_key
      );
    });
    console.log(");\n");
  });
}

function importValueStaticTables() {
  Object.keys(value_fields).forEach(field => {
    console.log("INSERT INTO %s_case_value_localized VALUES (", field);
    console.log("  'en',");
    value_fields[field].forEach(value_key => {
      console.log(
        "  '%s',",
        lookup[`${field}_value_${value_key}`].replace("'", "''")
      );
      console.log(
        "  '%s',",
        lookup[`${field}_value_${value_key}`]
          .replace("'", "''")
          .replace(/ \(.+\)/, "")
      );
    });
    console.log(");\n");
  });
}

function cleanupValueStaticTables() {
  Object.keys(value_fields).forEach(field => {
    console.log("DROP TABLE %s_case_value_localized;", field);
  });
}

function migration8() {
  createCaseStaticTable();
  createSectionsStaticTable();
}

function migration9() {
  importCaseStaticTable();
  importSectionStaticTable();
}

function migration10() {
  createValueStaticTables();
  importValueStaticTables();
}

// cleanupValueStaticTables();
// migration10();

function migration8_v2() {
  // define table
  console.log("CREATE TABLE case_static_localized (");
  pairs.forEach(pair =>
    console.log("  %s TEXT DEFAULT 'Localized %s',", pair[0], pair[0])
  );
  console.log(");\n");
  console.log("INSERT INTO case_static_localized VALUES (");
  pairs.forEach(pair =>
    console.log("  '%s',", pair[1].replace("'", "''").replace("null", ""))
  );
  console.log(");\n");
}

migration8_v2();
