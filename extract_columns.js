// Extract field values from db
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
let { db, sql, as } = require("./api/helpers/db");
async = require("async");
jsonPretty = require("json-pretty");
var fs = require("fs");

const empty_case = {
  // title: "",
  // body: "",
  // language: "en",
  // user_id: null,
  // original_language: "en",
  issue: null,
  communication_mode: null,
  communication_with_audience: null,
  // content_country: null,
  decision_method: null,
  facetoface_online_or_both: null,
  facilitated: null,
  voting: "none",
  // number_of_meeting_days: null,
  ongoing: false,
  // total_number_of_participants: null,
  targeted_participant_demographic: "General Public",
  kind_of_influence: null,
  targeted_participants_public_role: "Lay Public",
  targeted_audience: "General Public",
  participant_selection: "Open to all",
  specific_topic: null,
  staff_type: null,
  type_of_funding_entity: null,
  typical_implementing_entity: null,
  typical_sponsoring_entity: null
  // who_else_supported_the_initiative: null,
  // who_was_primarily_responsible_for_organizing_the_initiative: null,
  // location: null,
  // lead_image_url: "",
  // other_images: "{}",
  // files: "{}",
  // videos: "{}",
  // tags: "{}",
  // featured: false
};

const empty_method = {
  // title: "",
  // body: "",
  // language: "en",
  // user_id: null,
  // original_language: "en",
  best_for: null,
  // communication_mode: null,
  decision_method: null,
  facilitated: null,
  governance_contribution: null,
  issue_interdependency: null,
  issue_polarization: null,
  issue_technical_complexity: null,
  kind_of_influence: null,
  method_of_interaction: null,
  public_interaction_method: null,
  // post_date: "now",
  published: true,
  typical_funding_source: null,
  typical_implementing_entity: null,
  typical_sponsoring_entity: null
  // updated_date: "now",
  // lead_image_url: "",
  // other_images: "{}",
  // files: "{}",
  // videos: "{}",
  // tags: "{}",
  // featured: false
};

const empty_organization = {
  // title: "",
  // body: "",
  // language: "en",
  // user_id: null,
  // original_language: "en",
  // executive_director: null,
  // post_date: "now",
  // published: true,
  sector: null
  // updated_date: "now",
  // location: null,
  // lead_image_url: "",
  // other_images: "{}",
  // files: "{}",
  // videos: "{}",
  // tags: "{}",
  // featured: false
};

function process_kind(reference, table, noun, cb) {
  let choices = {};
  let nick_choices = {};
  let english = {};
  async.eachSeries(
    Object.keys(reference),
    function(key, next) {
      choices[key] = {};
      // console.log(`SELECT DISTINCT ${key} from ${table};`);
      db
        .any(`SELECT DISTINCT ${key} from ${table};`)
        .then(data => {
          let values = {};
          data.forEach(function(options) {
            values[options[key]] = true;
            choices[key][options[key]] = true;
          });
          next();
        })
        .catch(error => {
          console.error(error);
        });
    },
    function(results) {
      Object.keys(choices).forEach(function(key) {
        let values = choices[key];
        values = Object.keys(values).map(function(value) {
          let nick = value
            .replace("&amp", "")
            .replace("#039;", "")
            .replace(/\s+/g, "_")
            .replace(/[\.,\-()&\$£]/g, "")
            .toLowerCase();
          english[nick] = value;
          return nick;
        });
        nick_choices[key] = values;
      });
      let fname = `./${noun}.choices.json`;
      console.log("Writing", fname);
      fs.writeFileSync(fname, jsonPretty(nick_choices));
      fname = `./${noun}.english`;
      console.log("Writing", fname);
      fs.writeFileSync(
        fname,
        Object.keys(english)
          .map(function(k) {
            return `${k}=${english[k]}`;
          })
          .join("\n")
      );
      cb();
    }
  );
}
async.series([
  function(cb) {
    process_kind(empty_case, "CASES", "case", cb);
  },
  function(cb) {
    process_kind(empty_method, "METHODS", "method", cb);
  },
  function(cb) {
    process_kind(empty_organization, "ORGANIZATIONS", "organization", cb);
  },
  function() {
    process.exit(0);
  }
]);
