const Sentry = require("@sentry/node");

const isProdOrStaging = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

let newrelic;

if (isProdOrStaging) {
  newrelic = require("newrelic");
}

function logError(error, params = {}) {
  if (isProdOrStaging) {
    if (typeof error === "string") {
      Sentry.captureMessage(error);
    } else {
      newrelic.noticeError(error, params);
      Sentry.captureException(error);
    }
  }
}

module.exports = logError;
