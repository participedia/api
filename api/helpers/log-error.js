const Sentry = require("@sentry/node");

const isProdOrStaging = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

function logError(error, params = {}) {
  if (isProdOrStaging) {
    if (typeof error === "string") {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  }
}

module.exports = logError;
