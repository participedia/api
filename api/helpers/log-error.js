const isProdOrStaging = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

let newrelic;

if (isProdOrStaging) {
  newrelic = require("newrelic");
}

function logError(error, params = {}) {
  if (isProdOrStaging && newrelic) {
    newrelic.noticeError(error, params);
  }
}

module.exports = logError;
