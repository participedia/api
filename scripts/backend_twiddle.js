const fs = require("fs");
const parse = require("csv-parse/lib/sync");

const splitOnce = (str, sep) => {
  let vals = str.split(sep);
  let key = vals.shift();
  let val = vals.join(sep).trim();
  let ret = [key, val];
  return ret;
};

function fileToPairs(filename) {
  const original = fs.readFileSync(filename, "utf8");
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
  return { pairs, lookup };
}

function group(list, number) {
  let ret = [];
  while (list.length) {
    let row = [];
    for (let i = 0; i < number; i++) {
      row.push(list.shift());
    }
    ret.push(row);
  }
  return ret;
}

function readCSV(filename) {
  const original = fs.readFileSync(filename, "utf8");
  const tuples = parse(original, {
    from: 2,
    cast: true,
    skip_lines_with_empty_values: true,
  });
  // console.log("Headers: %s", tuples[0]);
  let headers = tuples.shift();
  tuples.forEach(t => {
    if (t.length !== 4) {
      console.log("Expected length 4, got length %s: %s", t.length, t);
    }
  });
  return tuples;
}

function prepCaseEdit() {
  let { pairs, lookup } = fileToPairs("migrations/backend_case_edit.csv");

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
}

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

function value_mapper(dbname) {
  let valuekeys = {};
  let memo = {};
  value_mapping = value => {
    if (!memo[value]) {
      let ret;
      if (getvalue === "Don't Know") {
        ret = "dk";
      } else if (getvalue === "Not Applicable") {
        ret = "na";
      } else {
        let v = value
          .toLowerCase()
          .replace(/[^A-Za-z0-9_ ]+/, "")
          .replace(/ in /, " ")
          .split(/\s+/g);
        if (valuekeys[v[0]]) {
          ret = v[0] + "_" + v[1];
        } else {
          ret = v[0];
        }
      }
      ret = ret.replace(/\W+/g, ""); // remove non-word characters
      valuekeys[ret] = true;
      memo[value] = `${dbname}_value_${ret}`;
    }
    return memo[value];
  };
  return value_mapping;
}

function migration9_v2() {
  const tuples = readCSV("csv/case_view_fields.csv");
  console.log("CREATE TABLE case_view_localized (");
  console.log("  language TEXT NOT NULL,");
  tuples.forEach(t => {
    [dbname, editTitle, viewTitle, values] = t;
    console.log("  %s TEXT DEFAULT 'Localized %s',", dbname, dbname);
    if (values && values.includes("\n")) {
      let value_mapping = value_mapper(dbname.replace("_label", ""));
      // remove double quotes around multi-line values, then split lines
      values
        .replace(/^"(.*)"$/, "$1")
        .split("\n")
        .forEach(value => {
          let key = value_mapping(value.trim());
          console.log("  %s TEXT DEFAULT 'Localized %s',", key, key);
        });
    }
  });
  console.log(");\n");
  console.log("INSERT INTO case_view_localized VALUES (");
  console.log("  'en',");
  tuples.forEach(t => {
    [dbname, editTitle, viewTitle, values] = t;
    console.log("  '%s',", viewTitle.replace("NONE", "").replace("'", "''"));
    if (values && values.includes("\n")) {
      values
        .replace(/^"(.*)"$/, "$1")
        .split("\n")
        .forEach(value => {
          console.log("  '%s',", value.trim().replace("'", "''"));
        });
    }
  });
  console.log(");\n");
}

migration9_v2();
