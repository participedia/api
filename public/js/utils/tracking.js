// Utility function to handle case when Google Analytics is down or slow.
// If the hitCallback function hasn't been called within 1s, execute the callback.
// https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits
// The following utility function accepts a function as input and returns a new function. If the returned function is called before the timeout period (the default timeout is one second), it clears the timeout and invokes the input function. If the returned function isn't called before the timeout period, the input function is called regardless.
function createFunctionWithTimeout(callback, opt_timeout) {
  var called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, opt_timeout || 1000);
  return fn;
}

const tracking = {
  send(eventCategory, eventAction, eventLabel = "") {
    if (!window.ga) return;

    window.ga("send", "event", eventCategory, eventAction, eventLabel);
  },

  sendWithCallback(eventCategory, eventAction, eventLabel = "", callback) {
    if (!window.ga) {
      callback();
      return;
    };
    window.ga("send", "event", eventCategory, eventAction, eventLabel, {
      hitCallback: createFunctionWithTimeout(callback)
    });
  }
}

export default tracking;
