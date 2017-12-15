"use strict";
const json2xmlparser = require("js2xmlparser");
const csvDelimiters = [",", "|", "%", "^"];

const filterFields = function(thing, filter) {
  if (typeof filter !== "object") {
    return thing;
  }

  const keys = Object.keys(filter);
  for (var k = 0; k < keys.length; k++) {
    const key = keys[k];
    const value = filter[key];
    // If the field is falsey, remove it from the thing if possible,
    // Else if it's an object, it's specifying that part of a
    // datastructure must be removed.
    if (!value) {
      // Check to stop us removing Object.prototype fields
      if (thing.hasOwnProperty(key)) delete thing[key];
    } else if (typeof value === "object") {
      // Filter value is specifying to remove some part(s) of a datastructure
      // This only makes sense if the data structure is an object or an array
      // of objects.
      if (thing.hasOwnProperty(key)) {
        if (Array.isArray(thing[key]) && typeof thing[key][0] === 'object') {
          // Data structure is an array of objects
          let array = thing[key];
          for (let i = 0; i < array.length; i++) {
            array[i] = filterFields(array[i], value);
          }
        } else if (typeof thing[key] === 'object') {
          // Data structure is a plain object.
          thing[key] = filterFields(thing[key], value);
        }
      }
    }
  }
  return thing;
};

const convertToCSV = function(object, type, template, filter) {
  return convertObjectToCSV(object, type, template) + "\n";
}

const convertObjectToCSV = function(object, type, template, depth=0) {
  let row = "";
  const delim = csvDelimiters[depth];

  const keys = Object.keys(template);
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k];
    if (object.hasOwnProperty(key)) {
      // The object will hold values that are null, arrays, objects, or primitives
      let field = object[key];
      if (field === null || field === undefined) {
        row += delim;
      } else if (Array.isArray(field)) {
        // field is a list
        row += convertListToCSV(field, template[key][0], depth) + delim;
      } else if (typeof field === 'object') {
        // field is an object
        row += convertObjectToCSV(field, type, template[key], depth) + delim;
      } else {
        // field is a primitive
        row += escapeCSVCell(String(field)) + delim;
      }
    } else {
      // The object doesn't have the property that the template has
      // Blank out the field(s) based on the template.
      row += templateToCSV(template[key], depth);
    }
  }
  //remove trailing comma
  if (row.length > 0) {
    row = row.slice(0,-1);
  }

  return row;
}

const convertListToCSV = function(list, template, depth) {
  // We want the values from non-empty lists, or to skip column(s) for empty lists.
  if (list.length > 0) {
    // List not empty, add the values
    if (typeof list[0] !== 'object') {
      // List of primitives
      return formatListStructure(list, depth);
    } else {
      // List of objects
      return formatObjectList(list, depth);
    }
  } else {
    // List is empty
    // Blank out the field(s) based on the template.
    return templateToCSV(template, depth).slice(0,-1);
  }
}

const formatListStructure = function(list, depth) {
	let formattedList = "";
	for (let n = 0; n < list.length; n++) {
		// Add the seperator from the previous interation
		if (n > 0) {
			formattedList += csvDelimiters[depth + 1];
		}
		formattedList += escapeCSVCell(list[n]);
	}
	return escapeCSVCellQuotes(formattedList);
}

const formatObjectList = function(list, depth) {
	const listsData = {};

	// Restructures data from a list of objects to an object containing lists.
	for (let i = 0; i < list.length; i++) {
	  const object = list[i];
		// loop through all keys for each object.
		const keys = Object.keys(object);
		for (var k = 0; k < keys.length; k++) {
			const key = keys[k];
			// if the key is not seen before, create a new data list for it
			if (!listsData.hasOwnProperty(key)) {
				listsData[key] = [];
			}
			if (object.hasOwnProperty(key)) {
			  listsData[key].push(object[key]);
			}
		}
	}

	// Convert the object containing lists into CSV fields
	let csvFields = "";
	let keys = Object.keys(listsData);
	for (let i = 0; i < keys.length; i++) {
		csvFields += formatListStructure(listsData[keys[i]], depth) + ",";
	}
	//remove trailing comma
  if (csvFields.length > 0) {
    return csvFields.slice(0,-1);
  }
	return csvFields;
}

const escapeCSVCell = function(cell) {
  if (cell === null || cell === undefined) return "";
  cell = String(cell);
  // If the cell matches double quote, newline, or any of our delimiters,
  // surround it with double quotes as a form of escaping.
  if (cell.match(/\"|\n|,|%|\^|\|/)) {
    // Double quotes are escaped by double-double quoting
    return escapeQuotes(cell);
  }
  return cell;
}

const escapeCSVCellQuotes = function(cell) {
  if (cell.match(/\"/)) {
    return escapeQuotes(cell);
  }
  return cell;
}

const escapeQuotes = function(cell) {
  cell = cell.replace(/"/g, '""');
  return '\"' + cell + '\"';
}

const templateToCSV = function(template, depth) {
  return templateToCSVHelper(template, depth);
}

const templateToCSVHelper = function(template, depth) {
  if (typeof template === "string") {
    return csvDelimiters[depth];
  } else if (Array.isArray(template)) {
    return templateToCSVHelper(template[0], depth);
  } else if (typeof template === "object") {
    let columns = "";
    const keys = Object.keys(template);
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      columns += templateToCSVHelper(template[key], depth);
    }
    return columns;
  }
}

const createHeaderForCSV = function(template) {
  let header = headerParse("", template);
  // Remove trailing comma
  if (header.length !== 0) {
    return header.slice(0,-1);
  }
  return header;
}

const headerParse = function(name, value, append="", prepend="") {
  // We construct using the template, so value can be
  // a string (representing type), a list, or an object.
  if (typeof value === "string") {
    return prepend + name + append + ",";
  } else if (Array.isArray(value)) {
    const firstInArray = value[0];
    append += "_list";

    // Recurse for the value inside the array
    return headerParse(name, firstInArray, append, prepend);
  } else if (typeof value === "object") {
    // Prepend the name of this object to the name of each field
    if (name.length > 0) prepend = name + "_" + prepend;
    // Loop through the fields in the object and add them to the csv
    const keys = Object.keys(value);
    let header = "";
    for (let k = 0; k < keys.length; k++) {
      header += headerParse(keys[k], value[keys[k]], append, prepend);
    }
    return header;
  } else {
    // Shouldn't get here
    return "";
  }
}

const convertToJSON = function (object, type, template={}, filter={}) {
  return JSON.stringify(filterFields(object, filter));
}

const convertToXML = function (object, type, template={}, filter={}) {
  const options = { declaration: { include: false }};
  const filteredObject = filterFields(object, filter);
  return json2xmlparser.parse(type, filteredObject, options);
}

const getDataHeader = function(mimetype, isMultiple, type, template) {
  if (mimetype === "application/json") {
    let header = "{\"OK\": true, \"data\":";
    if (isMultiple) header += "[";
    return header;
  } else if (mimetype === "application/xml") {
    let header = "<?xml version='1.0'?>\n";
    if (isMultiple) header += "<" + type + "s>\n";
    return header;
  } else if (mimetype === "text/csv") {
    return createHeaderForCSV(template) + "\n";
  }
}

const getDataFooter = function(mimetype, isMultiple, type) {
  if (mimetype === "application/json") {
    let header = "";
    if (isMultiple) header += "]";
    return header + "}";
  } else if (mimetype === "application/xml") {
    let header = "";
    if (isMultiple) header += "</" + type + "s>\n";
    return header;
  } else if (mimetype === "text/csv") {
    // None needed!
    return "";
  }
}

const getObjectConverter = function(mimetype) {
  if (mimetype === "application/json") {
    return convertToJSON;
  } else if (mimetype === "application/xml") {
    return convertToXML;
  } else if (mimetype === "text/csv") {
    return convertToCSV;
  }
}

module.exports = {
  filterFields,
  getDataHeader,
  getObjectConverter,
  getDataFooter,
  escapeCSVCell,
  formatListStructure,
  formatObjectList,
  createHeaderForCSV,
  convertToCSV,
  convertToXML,
}
