"use strict";
const os = require("os");
const fs = require("fs");
const path = require("path");
let { clone } = require("lodash");
const {
  getThingByRequest,
} = require("./things");
const log = require("winston");
const bibutils = require("bibutils.js");
const Cite = require("citation-js");

// Format objects to determine which library handles the request
const citationJsFormats = registerCitationFormats(Cite);
const bibutilsFormats = Object.values(bibutils.formats.human.to);
const allFormats = [].concat(citationJsFormats, bibutilsFormats, ["csl"]);

// Mapping to get citation-js `type`
const citationJsTypes = {
  "text/html"       : "html",
  "text/plain"      : "string",
}

// bibutils programs require this to be it's own file!
// Specifies that `Participedia Contributors` is not a human's name.
const asis = path.resolve(__dirname, "citationformats", "asis.txt");

function registerCitationFormats(Cite) {
  const nativelySupported = ["apa","harvard1"];
  // Trivial to add more - https://github.com/citation-style-language/styles
  const formats = ["apsa","asa","chicago","mhra","nlm","nature","ieee","mla", "vancouver1"];
  formats.forEach(function(format) {
    registerCitationFormat(format);
  });
  return formats.concat(nativelySupported);
}

function registerCitationFormat(name) {
  const filepath = path.resolve(__dirname, "citationformats", name + ".csl");
  Cite.CSL.register.addTemplate(name,fs.readFileSync(filepath, "utf8"));
}

/* It'd be trivial to modify this functionality for internationalisation,
 * citationJs supports it with the `lang` option.
 * We just need some way of translating 'Participedia contributors'.
 * Would also need to add the localized strings to the asis.txt file for bibutils.
 */
const returnCitation = async function(req, res, next) {
  try {
    const thingType = req.params.thingtype;
    const thingId = req.params.thingid;
    const thing = await getThingByRequest(thingType, req);

    const baseurl = process.env.PROD_SITE_URL || "https://participedia.xyz/";
    const url = baseurl + thingType + "/" + thingId;

    // Get our custom header to determine the desired citation format
    const desiredFormat = req.headers["citation-format"];
    if (!desiredFormat) {
      // No parameter given; return list of available formats
      return invalidFormat(res);
    } else if (bibutilsFormats.includes(desiredFormat)) {
      // Create the data to set the headers with
      const extension = bibutils.metadata.extension[desiredFormat];
      const filename = thingType + "-" + thingId + extension;
      const mimetype = bibutils.metadata.mime[desiredFormat];

      // Handle the machine readable formats with bibutils.js
      const cb = function(data){
        if (!res.headersSent) {
          setFileHeaders(res, filename, mimetype);
          return res.status(200).send(data);
        }
      };
      const ris = constructRIS(thing, url);
      const convertFrom = bibutils.formats.constants.from.RIS;
      bibutils.convert(convertFrom, desiredFormat, ris, cb, ["-as", asis]);
    } else if (citationJsFormats.includes(desiredFormat)) {
      // Handle the human readable formats with citation.js

      // Content negotiate to decide if html or plaintext
      const serverAcceptable = Object.keys(citationJsTypes);
      const mimetype = req.accepts(serverAcceptable);
      if (!mimetype) {
        return res.status(406).send(serverAcceptable);
      }

      const output = new Cite(constructCslJson(thing, url)).get({
        format: "string",
        type: citationJsTypes[mimetype],
        style: "citation-" + desiredFormat,
        lang: "en-GB"
      })
      res.setHeader("Content-Type", mimetype);
      return res.status(200).send(output);
    } else if (desiredFormat === "csl") {
      // We can also return CSL-JSON because we know how to construct it
      const filename = thingType + "-" + thingId + ".json";
      setFileHeaders(res, filename, "application/json");
      return res.status(200).send(constructCslJson(thing, url));
    } else {
      // Parameter not something we accept; return list of available formats
      return invalidFormat(res);
    }
  } catch (error) {
    log.error("Exception in GET /%s/%s => %s", type, req.params.thingid, error);
    // If error encountered after headers sent, abort the response.
    if (res.headersSent) {
        return next(error);
    }
    return res.status(500).json({
      OK: false,
      error: error
    });
  }
}

function invalidFormat(res) {
  const message = "Set `citation-format` header to one of the following: " + allFormats;
  return res.status(400).send(message);
}

function setFileHeaders(res, filename, mimetype) {
  res.setHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
  res.setHeader("Content-Type", mimetype);
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
}

function constructRIS(thing, site_url) {
  // Fallback to post date or now if unset
  const updated = thing.updated_date || thing.post_date || new Date();
  let ris = "TY  - ELEC\n";
  ris    += "ID  - Participedia" + thing.type + thing.id + "\n";
  ris    += "AU  - Participedia contributors\n";
  ris    += "TI  - " + thing.title + "\n";
  ris    += "UR  - " + site_url + "\n";
  ris    += "Y1  - " + risDateStr(new Date(updated)); + "\n";
  ris    += "Y2  - " + risDateStr(new Date()); + "\n";
  ris    += "L2  - " + site_url + "\n";
  ris    += "ER  -";
  return ris;
}

function risDateStr(date) {
  return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "/";
}

function constructCslJson(thing, site_url) {
  // Fallback to post date or now if unset
  const updated = thing.updated_date || thing.post_date || new Date();
  const csl = {};
  csl.type = "encyclopedia-entry";
  csl.id = "Participedia" + thing.type + thing.id;
  csl.title = thing.title;
  csl["container-title"] = "Participedia";
  csl["author"] = [{"literal": "Participedia contributors"}];
  csl.URL = site_url;
  csl.accessed = cslDateParts(new Date());
  csl.issued = cslDateParts(new Date(updated))
  return csl;
}

function cslDateParts(date) {
  return { "date-parts": [[date.getFullYear(),(date.getMonth() + 1),date.getDate()]] }
}

module.exports = {
  returnCitation,
}
